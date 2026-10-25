import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'

const router = Router()

const UNI_DOMAIN = process.env.UNI_EMAIL_DOMAIN || 'cfd.nu.edu.pk'
const STUDENT_ID_FORMAT = /^\d{2}[A-Z]-\d{4}$/ // e.g. 22F-3294

// POST /api/auth/register - students only, staff accounts are created with the seed script
router.post('/register', (req, res) => {
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
  db.prepare(
    `INSERT INTO users (full_name, student_id, email, password_hash, role, is_verified)
     VALUES (?, ?, ?, ?, 'student', 0)`,
  ).run(fullName, studentId, email, passwordHash)

  res.status(201).json({ message: 'Account created' })
})

export default router
