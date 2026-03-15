const pool = require('./db/pool');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const migrationFile = path.join(__dirname, 'db/migrations/011_variants_system.sql');
    
    try {
        console.log('Reading migration file...');
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        console.log('Running migration 011_variants_system.sql...');
        await pool.query(sql);
        
        console.log('✅ Migration completed successfully!');
        console.log('Tables created:');
        console.log('  - attributes');
        console.log('  - attribute_options');
        console.log('  - product_variants');
        console.log('  - variant_attributes');
        console.log('  - product_attributes');
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        if (err.message.includes('already exists')) {
            console.log('Note: Some tables may already exist. This is OK if re-running.');
        }
    } finally {
        await pool.end();
    }
}

runMigration();

