import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { signToken, requireAuth } from '../middleware/auth.js'

const router = Router()

// only send the client what it needs, never the password hash
function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    studentId: user.student_id,
  }
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const body = req.body || {}
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  // same message for a wrong email and a wrong password so nobody can find out which emails exist
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (!user.is_verified) {
    return res.status(403).json({ error: 'Please verify your email first. Check your inbox for the link.' })
  }

  res.json({ token: signToken(user), user: toPublicUser(user) })
})

// GET /api/auth/me - the client calls this on page load to check if the saved token still works
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ user: toPublicUser(user) })
})

export default router
