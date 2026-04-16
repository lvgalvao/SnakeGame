const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE,
  ssl: { rejectUnauthorized: false },
});

pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id        SERIAL PRIMARY KEY,
    player_name TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`).catch((err) => {
  console.error('DB init failed:', err.message);
  process.exit(1);
});

module.exports = pool;
