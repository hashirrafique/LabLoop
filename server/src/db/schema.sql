-- LabLoop database schema (from our design document)
-- Runs every time the server starts, so every table uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  student_id    TEXT UNIQUE,                 -- only students have one, e.g. 22F-3294
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'lab_engineer', 'hod')),
  is_verified   INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at    TEXT
);

-- one row per type of item, e.g. "Arduino Uno Kit"
CREATE TABLE IF NOT EXISTS equipment (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT,
  max_loan_days INTEGER NOT NULL DEFAULT 7,
  is_retired    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- one row per physical piece, e.g. 5 Arduino kits = 5 units
CREATE TABLE IF NOT EXISTS equipment_units (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id  INTEGER NOT NULL REFERENCES equipment(id),
  serial_number TEXT NOT NULL UNIQUE,
  condition     TEXT NOT NULL DEFAULT 'good'
                CHECK (condition IN ('new', 'good', 'fair', 'damaged')),
  is_retired    INTEGER NOT NULL DEFAULT 0
);

-- dates are stored as 'YYYY-MM-DD' text
CREATE TABLE IF NOT EXISTS loan_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id    INTEGER NOT NULL REFERENCES users(id),
  equipment_id  INTEGER NOT NULL REFERENCES equipment(id),
  collect_date  TEXT NOT NULL,
  return_date   TEXT NOT NULL,
  purpose       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'issued', 'returned', 'cancelled')),
  decided_by    INTEGER REFERENCES users(id),
  decision_note TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS loans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id  INTEGER NOT NULL UNIQUE REFERENCES loan_requests(id),
  unit_id     INTEGER NOT NULL REFERENCES equipment_units(id),
  issued_by   INTEGER NOT NULL REFERENCES users(id),
  issued_at   TEXT NOT NULL DEFAULT (datetime('now')),
  due_date    TEXT NOT NULL,
  returned_at TEXT
);

-- condition of a unit when it is added, issued and returned
CREATE TABLE IF NOT EXISTS condition_logs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id   INTEGER NOT NULL REFERENCES equipment_units(id),
  loan_id   INTEGER REFERENCES loans(id),
  stage     TEXT NOT NULL CHECK (stage IN ('added', 'issue', 'return')),
  condition TEXT NOT NULL,
  note      TEXT,
  logged_by INTEGER REFERENCES users(id),
  logged_at TEXT NOT NULL DEFAULT (datetime('now'))
);
