#!/usr/bin/env node
/**
 * Migration 011 Runner - Product Variants System
 * Run: node run_migration_011.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables BEFORE importing pool
const dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
    const envContent = fs.readFileSync(dotenvPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = value;
        }
    });
    console.log('✅ Loaded environment from .env file\n');
}

// Now import pool after env is loaded
const pool = require('./db/pool');

async function runMigration() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔄 Running Migration 011: Product Variants System');
    console.log('═══════════════════════════════════════════════════════════\n');

    const migrationFile = path.join(__dirname, 'db/migrations/011_variants_system.sql');
    
    if (!fs.existsSync(migrationFile)) {
        console.error('❌ Migration file not found:', migrationFile);
        process.exit(1);
    }

    try {
        // Check current status
        console.log('📊 Checking current database status...');
        const checkResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes')
        `);
        
        const existingTables = checkResult.rows.map(r => r.table_name);
        
        if (existingTables.length === 5) {
            console.log('✅ All tables already exist:');
            existingTables.forEach(t => console.log(`   • ${t}`));
            console.log('\n✅ Migration already applied! No action needed.\n');
            await pool.end();
            return;
        }

        if (existingTables.length > 0) {
            console.log('⚠️  Partial migration detected. Tables exist:');
            existingTables.forEach(t => console.log(`   • ${t}`));
            console.log('\n🔄 Continuing with remaining tables...\n');
        }

        // Read and execute migration
        console.log('📂 Reading migration file...');
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        console.log('🚀 Executing migration...\n');
        await pool.query(sql);
        
        console.log('✅ Migration completed successfully!\n');
        console.log('📋 Tables created:');
        console.log('   • attributes - Global attribute definitions');
        console.log('   • attribute_options - Attribute values (Red, Large, etc.)');
        console.log('   • product_variants - Individual variant SKUs with stock/price');
        console.log('   • variant_attributes - Links variants to attribute options');
        console.log('   • product_attributes - Links products to available attributes\n');
        
        // Verify
        const verifyResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes')
            ORDER BY table_name
        `);
        
        console.log('🔍 Verification:');
        verifyResult.rows.forEach(r => console.log(`   ✅ ${r.table_name}`));
        console.log('');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('\n⚠️  Some tables already exist. This is OK if migration was partially applied before.');
            console.log('   You can safely ignore this error.\n');
        } else {
            console.error('\nFull error:', error);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

runMigration();

