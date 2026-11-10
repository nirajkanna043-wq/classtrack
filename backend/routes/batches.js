const router = require('express').Router();
const db = require('../db');

const save = db.transaction((id, name, sids = [], day = null, time = '', days = '[]', weeks = 2) => {
  const daysStr = typeof days === 'string' ? days : JSON.stringify(days || []);
  const weeksNum = parseInt(weeks) || 2;
  const dayNum = (day !== null && day !== undefined && day !== '') ? parseInt(day) : null;

  db.prepare(`INSERT INTO batches (id, name, day, time, days, weeks) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, day = excluded.day, time = excluded.time, days = excluded.days, weeks = excluded.weeks`)
    .run(id, name, dayNum, time || '', daysStr, weeksNum);

  db.prepare('DELETE FROM batch_students WHERE batch_id = ?').run(id);
  const ins = db.prepare('INSERT OR IGNORE INTO batch_students (batch_id, student_id) VALUES (?, ?)');
  sids.forEach(s => ins.run(id, s));
});

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM batches').all().map(b => {
    let parsedDays = [];
    try { parsedDays = JSON.parse(b.days || '[]'); } catch(e){}
    if (!parsedDays.length && b.day !== null && b.day !== undefined) parsedDays = [b.day];
    return {
      ...b,
      days: parsedDays,
      weeks: b.weeks || 2,
      sids: db.prepare('SELECT student_id FROM batch_students WHERE batch_id = ?').all(b.id).map(r => r.student_id),
    };
  }));
});

router.post('/', (req, res) => {
  const { id, name, sids, day, time, days, weeks } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name are required' });
  save(id, name, sids, day, time, days, weeks);
  res.status(201).json({ ok: true });
});

router.put('/:id', (req, res) => {
  const { name, sids, day, time, days, weeks } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  save(req.params.id, name, sids, day, time, days, weeks);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM batches WHERE id = ?').run(req.params.id); // scheduled classes are kept
  res.json({ ok: true });
});

module.exports = router;
