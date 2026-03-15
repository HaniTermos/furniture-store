const pool = require('./db/pool');
const fs = require('fs');
const path = require('path');

async function testMigration() {
    console.log('Testing Variants System Migration...\n');
    
    try {
        // Check if tables exist
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes')
        `);
        
        const existingTables = result.rows.map(r => r.table_name);
        
        if (existingTables.length === 5) {
            console.log('✅ All 5 variant system tables exist:');
            existingTables.forEach(t => console.log(`   - ${t}`));
            console.log('\n✅ Migration is already applied!');
            await pool.end();
            return;
        }
        
        console.log('⚠️  Migration not applied. Running migration...\n');
        
        // Run migration
        const migrationFile = path.join(__dirname, 'db/migrations/011_variants_system.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        await pool.query(sql);
        
        console.log('✅ Migration completed successfully!');
        console.log('Tables created:');
        console.log('  - attributes');
        console.log('  - attribute_options');
        console.log('  - product_variants');
        console.log('  - variant_attributes');
        console.log('  - product_attributes');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.message.includes('already exists')) {
            console.log('\nNote: Some tables already exist. Migration may be partially applied.');
        }
    } finally {
        await pool.end();
    }
}

testMigration();

