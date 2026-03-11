// db/migrate.js
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        console.log('🔄 Running database migration...');

        // 1. Run base schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('  ✅ Base schema applied');

        // 2. Run numbered migration files in order
        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir)
                .filter(f => f.endsWith('.sql'))
                .sort();

            for (const file of files) {
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                await pool.query(sql);
                console.log(`  ✅ Migration ${file} applied`);
            }
        }

        console.log('✅ All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();