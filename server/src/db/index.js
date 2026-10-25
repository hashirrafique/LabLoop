import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// database file lives in server/data/ (ignored by git)
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', '..', 'data', 'labloop.db')
if (dbFile !== ':memory:') {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true })
}

const db = new Database(dbFile)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// tables use CREATE TABLE IF NOT EXISTS so this is safe to run on every start
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)

export default db
