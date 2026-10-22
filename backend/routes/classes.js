const router = require('express').Router();
const db = require('../db');

const save = db.transaction((c) => {
  db.prepare(`INSERT INTO classes (id, name, date, time, batch_id) VALUES (@id, @name, @date, @time, @bid)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, date = excluded.date, time = excluded.time, batch_id = excluded.batch_id`)
    .run({ id: c.id, name: c.name, date: c.date, time: c.time, bid: c.bid || null });
  db.prepare('DELETE FROM class_students WHERE class_id = ?').run(c.id);
  const ins = db.prepare('INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)');
  (c.sids || []).forEach(s => ins.run(c.id, s));
});

router.get('/', (req, res) => {
  const { date } = req.query; // optional ?date=YYYY-MM-DD
  const rows = date
    ? db.prepare('SELECT * FROM classes WHERE date = ? ORDER BY time').all(date)
    : db.prepare('SELECT * FROM classes ORDER BY date, time').all();
  res.json(rows.map(c => ({
    ...c, sids: db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(c.id).map(r => r.student_id),
  })));
});

router.post('/', (req, res) => {
  const c = req.body;
  if (!c.id || !c.name || !c.date || !c.time) return res.status(400).json({ error: 'id, name, date, time are required' });
  save(c);
  res.status(201).json({ ok: true });
});

router.put('/:id', (req, res) => {
  const c = { ...req.body, id: req.params.id };
  if (!c.name || !c.date || !c.time) return res.status(400).json({ error: 'name, date, time are required' });
  save(c);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id); // cascades to attendance
  res.json({ ok: true });
});

module.exports = router;
