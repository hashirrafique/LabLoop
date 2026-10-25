import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './db/index.js'
import registerRoutes from './routes/register.js'

const app = express()

app.use(cors())
app.use(express.json())

// quick check that the server and the database are working
app.get('/api/health', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS users FROM users').get()
  res.json({ status: 'ok', users: row.users })
})

app.use('/api/auth', registerRoutes)

// any error thrown inside a route ends up here
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`LabLoop API running on http://localhost:${PORT}`)
})
