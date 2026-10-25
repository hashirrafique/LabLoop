import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import db from '../db/index.js'
import { sendVerificationEmail } from '../utils/mailer.js'

const router = Router()

const UNI_DOMAIN = process.env.UNI_EMAIL_DOMAIN || 'cfd.nu.edu.pk'
const STUDENT_ID_FORMAT = /^\d{2}[A-Z]-\d{4}$/ // e.g. 22F-3294

// POST /api/auth/register - students only, staff accounts are created with the seed script
router.post('/register', async (req, res) => {
  const body = req.body || {}
  const fullName = String(body.fullName || '').trim()
  const studentId = String(body.studentId || '').trim().toUpperCase()
  const email = String(body.email || '').trim()
  const password = String(body.password || '')

  if (!fullName || !studentId || !email || !password) {
    return res.status(400).json({ error: 'Please fill in all the fields' })
  }
  if (!email.endsWith('@' + UNI_DOMAIN)) {
    return res.status(400).json({ error: `Please use your university email (@${UNI_DOMAIN})` })
  }
  if (!STUDENT_ID_FORMAT.test(studentId)) {
    return res.status(400).json({ error: 'Student ID should look like 22F-1234' })
  }
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters and contain a letter and a number' })
  }
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }
  if (db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId)) {
    return res.status(409).json({ error: 'This student ID is already registered' })
  }

  // never store the plain password
  const passwordHash = bcrypt.hashSync(password, 10)
  const result = db
    .prepare(
      `INSERT INTO users (full_name, student_id, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, ?, 'student', 0)`,
    )
    .run(fullName, studentId, email, passwordHash)

  // account stays inactive until the link in the email is opened
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare(
    `INSERT INTO email_verifications (user_id, token, expires_at)
     VALUES (?, ?, datetime('now', '+24 hours'))`,
  ).run(result.lastInsertRowid, token)

  await sendVerificationEmail(email, fullName, token)

  res.status(201).json({
    message: 'Account created. We sent a verification link to your university email.',
  })
})

// GET /api/auth/verify-email?token=... - opened from the link in the email
router.get('/verify-email', (req, res) => {
  const token = String(req.query.token || '')
  const row = db
    .prepare(
      `SELECT id, user_id, used_at, expires_at < datetime('now') AS expired
       FROM email_verifications
       WHERE token = ?`,
    )
    .get(token)

  if (!row) {
    return res.status(400).json({ error: 'This verification link is not valid' })
  }
  if (row.used_at) {
    return res.json({ message: 'Your email is already verified, you can log in.' })
  }
  if (row.expired) {
    return res
      .status(400)
      .json({ error: 'This verification link has expired. Please contact the lab engineer.' })
  }

  db.transaction(() => {
    db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(row.user_id)
    db.prepare("UPDATE email_verifications SET used_at = datetime('now') WHERE id = ?").run(row.id)
  })()

  res.json({ message: 'Email verified! You can log in now.' })
})

export default router
