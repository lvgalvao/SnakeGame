const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();
const MAX_SCORE = 397;

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, player_name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'database error', detail: err.message });
  }
});

router.post('/', async (req, res) => {
  const { player_name, score } = req.body || {};
  const name = typeof player_name === 'string' ? player_name.trim().slice(0, 32) : '';
  const numeric = Number(score);
  if (!name || !Number.isFinite(numeric) || numeric < 0) {
    return res.status(400).json({ error: 'player_name and non-negative score required' });
  }
  if (numeric > MAX_SCORE) {
    return res.status(400).json({ error: 'score inválido' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO scores (player_name, score) VALUES ($1, $2) RETURNING id, player_name, score',
      [name, Math.floor(numeric)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'database error', detail: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'database error', detail: err.message });
  }
});

module.exports = router;
