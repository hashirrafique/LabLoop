import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// GET /api/catalogue?q=arduino&category=Microcontrollers
// damaged and retired units are not counted because they can't be lent out
router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim()
  const category = String(req.query.category || '').trim()

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

  res.json({ items })
})

// GET /api/catalogue/categories - used to fill the category dropdown
router.get('/categories', (req, res) => {
  const rows = db
    .prepare('SELECT DISTINCT category FROM equipment WHERE is_retired = 0 ORDER BY category')
    .all()
  res.json({ categories: rows.map((row) => row.category) })
})

export default router
