import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret'

// the token stores the user id and role, so routes can check the role without a db query
export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
}

// put this on any route that needs a logged in user, it sets req.user = { id, role }
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Please log in first' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Your session is invalid or has expired, please log in again' })
  }
}

// use after requireAuth, e.g. router.post('/', requireAuth, requireRole('lab_engineer'), ...)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this' })
    }
    next()
  }
}
