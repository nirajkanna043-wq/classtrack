const router = require('express').Router();
const db = require('../db');

const save = db.transaction((id, name, sids = []) => {
  db.prepare(`INSERT INTO batches (id, name) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name`).run(id, name);
  db.prepare('DELETE FROM batch_students WHERE batch_id = ?').run(id);
  const ins = db.prepare('INSERT OR IGNORE INTO batch_students (batch_id, student_id) VALUES (?, ?)');
  sids.forEach(s => ins.run(id, s));
});

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM batches').all().map(b => ({
    ...b, sids: db.prepare('SELECT student_id FROM batch_students WHERE batch_id = ?').all(b.id).map(r => r.student_id),
  })));
});

router.post('/', (req, res) => {
  const { id, name, sids } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name are required' });
  save(id, name, sids);
  res.status(201).json({ ok: true });
});

router.put('/:id', (req, res) => {
  const { name, sids } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  save(req.params.id, name, sids);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM batches WHERE id = ?').run(req.params.id); // scheduled classes are kept
  res.json({ ok: true });
});

module.exports = router;
