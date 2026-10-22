const router = require('express').Router();
const db = require('../db');

const upsert = db.prepare(`INSERT INTO students (id, name, quota) VALUES (@id, @name, @quota)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, quota = excluded.quota`);

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM students').all()));

router.post('/', (req, res) => {
  const { id, name, quota } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name are required' });
  upsert.run({ id, name, quota: Math.max(1, parseInt(quota) || 8) });
  res.status(201).json({ ok: true });
});

router.put('/:id', (req, res) => {
  const { name, quota } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  upsert.run({ id: req.params.id, name, quota: Math.max(1, parseInt(quota) || 8) });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id); // cascades to batches/classes/attendance
  res.json({ ok: true });
});

module.exports = router;
