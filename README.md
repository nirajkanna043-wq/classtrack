# ClassTrack – Online class scheduler & attendance

Full-stack app: static frontend + Node.js/Express REST API + SQLite database.

## Structure
```
classtrack/
├── frontend/index.html          UI (calendar, batches, attendance, completed tab)
├── backend/
│   ├── server.js                Express app (API + serves frontend)
│   ├── db.js                    SQLite connection + table creation
│   ├── package.json
│   └── routes/
│       ├── state.js             GET  /api/state
│       ├── students.js          GET/POST/PUT/DELETE /api/students
│       ├── batches.js           GET/POST/PUT/DELETE /api/batches
│       ├── classes.js           GET/POST/PUT/DELETE /api/classes
│       └── attendance.js        PUT/DELETE /api/attendance, GET /api/attendance/student/:id
└── .gitignore
```

## Run locally
```
cd backend
npm install
npm start
```
Open http://localhost:3000

## Deploy (Render / Railway)
Root directory `backend`, build `npm install`, start `npm start`.
SQLite is a file: attach a persistent disk and set `DB_FILE` to a path on it (e.g. `/data/classtrack.db`), otherwise data resets on redeploy.
GitHub Pages cannot run the backend (it only hosts static files).
