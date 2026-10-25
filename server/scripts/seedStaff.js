// Creates the lab engineer and HoD accounts.
// Staff can't sign up through the website, so run this once after setting up:
//   npm run seed:staff
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db from '../src/db/index.js'

const password = process.env.STAFF_PASSWORD || 'LabLoop@2026'

const staff = [
  { fullName: 'Lab In-charge', email: 'labengineer@labloop.test', role: 'lab_engineer' },
  { fullName: 'HoD Computer Science', email: 'hod@labloop.test', role: 'hod' },
]

const insert = db.prepare(`
  INSERT INTO users (full_name, email, password_hash, role, is_verified)
  VALUES (?, ?, ?, ?, 1)
`)

for (const person of staff) {
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(person.email)
  if (exists) {
    console.log(`${person.email} already exists, skipped`)
    continue
  }
  insert.run(person.fullName, person.email, bcrypt.hashSync(password, 10), person.role)
  console.log(`created ${person.role} account: ${person.email}`)
}

console.log(`password for staff accounts: ${password}`)
