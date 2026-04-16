const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const dbUrl = process.env.DATABASE;
  if (!dbUrl) {
    return res.status(500).json({ ok: false, db: 'DATABASE env var not set' });
  }
  const pool = require('./db');
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected', host: dbUrl.split('@')[1]?.split('/')[0] });
  } catch (err) {
    res.status(500).json({ ok: false, db: err.message });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

module.exports = app;
