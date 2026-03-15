const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Hardcoded connection for local development
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'furniture_store',
    user: 'postgres',
    password: 'postgres',
});

async function runMigration() {
    const migrationFile = path.join(__dirname, 'db/migrations/011_variants_system.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration 011_variants_system.sql...');
    
    try {
        await pool.query(sql);
        console.log('✅ Migration completed successfully!');
        
        // Verify tables were created
        const { rows } = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes')
        `);
        console.log('Created tables:', rows.map(r => r.table_name).join(', '));
        
        // Check sample data
        const { rows: attrs } = await pool.query('SELECT * FROM attributes');
        console.log('Sample attributes:', attrs.map(a => a.name).join(', '));
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();

