const pool = require('./db/pool');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'db', 'migrations', '016_fix_size_guides_columns.sql'), 'utf8');
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
