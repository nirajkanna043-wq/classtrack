const router = require('express').Router();
const db = require('../db');

// PUT /api/attendance  { classId, studentId, status: 'p' | 'a' | 'r' }
router.put('/', (req, res) => {
  const { classId, studentId, status } = req.body;
  if (!classId || !studentId || !['p', 'a', 'r'].includes(status))
    return res.status(400).json({ error: 'classId, studentId and status (p/a/r) are required' });
  db.prepare(`INSERT INTO attendance (class_id, student_id, status) VALUES (?, ?, ?)
    ON CONFLICT(class_id, student_id) DO UPDATE SET status = excluded.status`).run(classId, studentId, status);
  res.json({ ok: true });
});

// DELETE /api/attendance/:classId/:studentId  (un-mark)
router.delete('/:classId/:studentId', (req, res) => {
  db.prepare('DELETE FROM attendance WHERE class_id = ? AND student_id = ?').run(req.params.classId, req.params.studentId);
  res.json({ ok: true });
});

// GET /api/attendance/student/:studentId – full history of one student
router.get('/student/:studentId', (req, res) => {
  res.json(db.prepare(`SELECT c.id AS classId, c.name, c.date, c.time, a.status
    FROM class_students cs JOIN classes c ON c.id = cs.class_id
    LEFT JOIN attendance a ON a.class_id = c.id AND a.student_id = cs.student_id
    WHERE cs.student_id = ? ORDER BY c.date, c.time`).all(req.params.studentId));
});

module.exports = router;
