const express = require('express');
const path = require('path');
require('./db'); // creates tables on first run

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use('/api/state', require('./routes/state'));
app.use('/api/students', require('./routes/students'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ClassTrack running at http://localhost:${PORT}`));
