// db/migrate.js
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        console.log('🔄 Running database migration...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();