const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

const listStmt = db.prepare(
  'SELECT id, player_name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 50'
);
const insertStmt = db.prepare(
  'INSERT INTO scores (player_name, score) VALUES (?, ?)'
);
const deleteStmt = db.prepare('DELETE FROM scores WHERE id = ?');

router.get('/', (req, res) => {
  res.json(listStmt.all());
});

const MAX_SCORE = 397; // 20×20 grid minus 3 starting segments

router.post('/', (req, res) => {
  const { player_name, score } = req.body || {};
  const name = typeof player_name === 'string' ? player_name.trim().slice(0, 32) : '';
  const numeric = Number(score);
  if (!name || !Number.isFinite(numeric) || numeric < 0) {
    return res.status(400).json({ error: 'player_name and non-negative score required' });
  }
  if (numeric > MAX_SCORE) {
    return res.status(400).json({ error: 'score inválido' });
  }
  const result = insertStmt.run(name, Math.floor(numeric));
  res.status(201).json({ id: result.lastInsertRowid, player_name: name, score: Math.floor(numeric) });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
  const result = deleteStmt.run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

module.exports = router;
