const pool = require('./db/pool');
const fs = require('fs');

async function runMigration() {
  try {
    const sql = fs.readFileSync('./db/migrations/013_fix_product_attributes2.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration 013 applied successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
