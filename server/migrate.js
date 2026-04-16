require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running ${file}…`);
    await pool.query(sql);
    console.log(`  done.`);
  }

  await pool.end();
  console.log('All migrations applied.');
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
