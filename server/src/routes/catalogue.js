import { Router } from 'express'
import db from '../db/index.js'
import { countBooked, isValidDate, today } from '../utils/availability.js'

const router = Router()

// GET /api/catalogue?q=arduino&category=Microcontrollers&from=2026-11-02&to=2026-11-06
// damaged and retired units are not counted because they can't be lent out
router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim()
  const category = String(req.query.category || '').trim()
  let from = String(req.query.from || '')
  let to = String(req.query.to || '')

  if (from || to) {
    if (!from || !to) {
      return res.status(400).json({ error: 'Please choose both a From date and a To date' })
    }
    if (!isValidDate(from) || !isValidDate(to)) {
      return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' })
    }
    if (to < from) {
      return res.status(400).json({ error: 'The To date cannot be before the From date' })
    }
    if (from < today()) {
      return res.status(400).json({ error: 'You cannot check dates in the past' })
    }
  } else {
    // no dates = show what is free today
    from = today()
    to = today()
  }

  const items = db
    .prepare(
      `SELECT e.id, e.name, e.category, e.description, e.max_loan_days AS maxLoanDays,
              COUNT(u.id) AS totalUnits
       FROM equipment e
       LEFT JOIN equipment_units u
         ON u.equipment_id = e.id AND u.is_retired = 0 AND u.condition != 'damaged'
       WHERE e.is_retired = 0
         AND (@q = '' OR e.name LIKE @like OR e.description LIKE @like)
         AND (@category = '' OR e.category = @category)
       GROUP BY e.id
       ORDER BY e.category, e.name`,
    )
    .all({ q, like: `%${q}%`, category })

  // requests that are waiting, approved or already handed over all hold a unit
  const bookings = db
    .prepare(
      `SELECT equipment_id, collect_date, return_date, status
       FROM loan_requests
       WHERE status IN ('pending', 'approved', 'issued')`,
    )
    .all()

  const result = items.map((item) => {
    const booked = countBooked(bookings, item.id, from, to)
    return { ...item, freeUnits: Math.max(item.totalUnits - booked, 0) }
  })

  res.json({ from, to, items: result })
})

// GET /api/catalogue/categories - used to fill the category dropdown
router.get('/categories', (req, res) => {
  const rows = db
    .prepare('SELECT DISTINCT category FROM equipment WHERE is_retired = 0 ORDER BY category')
    .all()
  res.json({ categories: rows.map((row) => row.category) })
})

export default router
