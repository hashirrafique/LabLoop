# LabLoop

LabLoop is a web app for lending out equipment from our department lab. At the moment the lab
keeps a paper register, so the only way to find out if something (an oscilloscope, an Arduino kit,
a DSLR etc.) is free is to walk to the lab and ask. LabLoop puts the lab's stock online: students
can see what the lab has, check if an item is free for the dates they need and send a borrow
request. The lab engineer approves requests and records when items go out and come back, the
system keeps track of due dates and overdue items, and the HoD gets usage reports for deciding
what to buy.

This is our semester project for **CS4002 Fundamentals of Software Project Management** at
FAST NUCES Chiniot-Faisalabad. The work is planned in Jira (project key **LL**) and the Jira
project is connected to this repo, so branches, commits and pull requests show up on the Jira
issues they belong to.

## Group members

| Name | Roll No. | Role |
|------|----------|------|
| Muhammad Hashir | 22F-3294 | Project Manager / Backend |
| Muhammad Usman Bal | 22F-3445 | Frontend / QA & UI-UX |

## Tech stack

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT tokens, passwords hashed with bcrypt
- **Email:** Nodemailer (verification links and due date reminders)
- **Project management:** Jira Scrum board + GitHub for Jira

## Folder structure

```
LabLoop/
├── client/   React frontend (Vite)
└── server/   Express API + SQLite database
```

## How to run it locally

You need Node.js 20 or newer.

```bash
# 1. backend
cd server
npm install
cp .env.example .env
npm run dev          # runs on http://localhost:5000

# 2. frontend (in a second terminal)
cd client
npm install
npm run dev          # opens on http://localhost:5173
```

The SQLite database file is created automatically in `server/data/` the first time the server
starts.

## How we work

- Every piece of work starts as an issue in Jira (LL-6, LL-7, ...)
- One branch per issue, named `LL-<number>-short-description` and made from `main`
- Every commit message starts with the issue key, e.g. `LL-7 Add login endpoint`
- Nothing goes into `main` directly. We open a pull request and the other member reviews it before it is merged
