// Puts some sample lab equipment (and a few bookings) in the database so the catalogue
// has something to show while we develop. The real list will come from the lab engineer.
//   npm run seed:equipment
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db from '../src/db/index.js'
import { today } from '../src/utils/availability.js'

const count = db.prepare('SELECT COUNT(*) AS n FROM equipment').get().n
if (count > 0) {
  console.log('equipment table already has data, nothing to do')
  console.log('(delete server/data/labloop.db if you want to start again)')
  process.exit(0)
}

// [name, category, description, max loan days, serial prefix, conditions of each unit]
const items = [
  ['Arduino Uno Starter Kit', 'Microcontrollers', 'Uno R3 board with breadboard, jumper wires, LEDs and basic sensors', 14, 'ARD', ['good', 'good', 'good', 'fair', 'new']],
  ['ESP32 Dev Board', 'Microcontrollers', 'WiFi and Bluetooth board, good for IoT projects', 14, 'ESP', ['new', 'new', 'good', 'good']],
  ['Raspberry Pi 4 (4GB)', 'Microcontrollers', 'Comes with power adapter and 32GB SD card', 14, 'RPI', ['good', 'good', 'fair']],
  ['Digital Storage Oscilloscope', 'Test & Measurement', '2 channel, 100 MHz', 3, 'OSC', ['good', 'good']],
  ['Digital Multimeter', 'Test & Measurement', null, 7, 'DMM', ['good', 'good', 'good', 'fair', 'fair', 'damaged']],
  ['Function Generator', 'Test & Measurement', 'Sine, square and triangle waves up to 20 MHz', 3, 'FGN', ['good']],
  ['Ultrasonic Sensor HC-SR04', 'Sensors & Modules', 'Distance sensor, 2 cm to 4 m', 14, 'USN', ['good', 'good', 'good', 'good', 'new', 'new']],
  ['DHT22 Temperature & Humidity Sensor', 'Sensors & Modules', null, 14, 'DHT', ['good', 'good', 'good', 'good']],
  ['Soldering Station', 'Tools', 'Temperature controlled, 60W', 2, 'SLD', ['good', 'fair']],
  ['DSLR Camera (Canon EOS 200D)', 'Cameras', 'With 18-55mm lens, mostly used for FYP demo videos', 5, 'CAM', ['good']],
]

const addItem = db.prepare(
  'INSERT INTO equipment (name, category, description, max_loan_days) VALUES (?, ?, ?, ?)',
)
const addUnit = db.prepare(
  'INSERT INTO equipment_units (equipment_id, serial_number, condition) VALUES (?, ?, ?)',
)

const ids = {}
db.transaction(() => {
  for (const [name, category, description, maxDays, prefix, conditions] of items) {
    const id = addItem.run(name, category, description, maxDays).lastInsertRowid
    conditions.forEach((condition, i) => {
      addUnit.run(id, `${prefix}-${String(i + 1).padStart(3, '0')}`, condition)
    })
    ids[prefix] = id
  }
})()

// a demo student with a few bookings, so "free units" is not always the full number
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA') // gives YYYY-MM-DD
}

const student = db
  .prepare(
    `INSERT INTO users (full_name, student_id, email, password_hash, role, is_verified)
     VALUES ('Demo Student', '22F-0001', 'demo.student@labloop.test', ?, 'student', 1)`,
  )
  .run(bcrypt.hashSync('Student@2026', 10)).lastInsertRowid

const t = today()
const addBooking = db.prepare(
  `INSERT INTO loan_requests (student_id, equipment_id, collect_date, return_date, purpose, status)
   VALUES (?, ?, ?, ?, ?, ?)`,
)
addBooking.run(student, ids.CAM, t, addDays(t, 4), 'FYP demo video', 'approved')
addBooking.run(student, ids.OSC, addDays(t, 2), addDays(t, 3), 'DLD lab task', 'pending')
addBooking.run(student, ids.ARD, addDays(t, 1), addDays(t, 10), 'Embedded systems project', 'approved')

console.log(`added ${items.length} items and 3 sample bookings`)
