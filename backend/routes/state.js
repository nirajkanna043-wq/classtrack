// GET /api/state – everything the frontend needs, in one call
const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const students = db.prepare('SELECT id, name, quota FROM students ORDER BY rowid').all();
  const batches = db.prepare('SELECT id, name FROM batches ORDER BY rowid').all().map(b => ({
    ...b,
    sids: db.prepare('SELECT student_id FROM batch_students WHERE batch_id = ?').all(b.id).map(r => r.student_id),
  }));
  const classes = db.prepare('SELECT id, name, date, time, batch_id AS bid FROM classes ORDER BY date, time').all().map(c => ({
    ...c,
    sids: db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(c.id).map(r => r.student_id),
  }));
  const att = {};
  db.prepare('SELECT class_id, student_id, status FROM attendance').all().forEach(r => {
    (att[r.class_id] = att[r.class_id] || {})[r.student_id] = r.status;
  });
  res.json({ students, batches, classes, att });
});

module.exports = router;
