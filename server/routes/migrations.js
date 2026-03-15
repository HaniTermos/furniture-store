const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');
const { auth, hasRole } = require('../middleware/auth');

// Admin middleware
const adminOnly = [auth, hasRole('admin', 'super_admin')];

// POST /api/admin/run-migration - Run migration 011
router.post('/run-migration', adminOnly, async (req, res) => {
    try {
        const migrationFile = path.join(__dirname, '../db/migrations/011_variants_system.sql');
        
        if (!fs.existsSync(migrationFile)) {
            return res.status(404).json({ error: 'Migration file not found' });
        }
        
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        // Run the migration with IF NOT EXISTS to handle partial migrations
        await pool.query(sql);
        
        res.json({ 
            success: true, 
            message: 'Migration 011_variants_system.sql completed successfully',
            tables: ['attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes']
        });
    } catch (error) {
        console.error('Migration error:', error);
        
        // If tables already exist, that's OK
        if (error.message.includes('already exists')) {
            return res.json({ 
                success: true, 
                message: 'Migration already applied (tables exist)',
                warning: error.message
            });
        }
        
        res.status(500).json({ 
            error: 'Migration failed', 
            details: error.message 
        });
    }
});

// POST /api/admin/force-migration - Force run migration 011 (idempotent)
router.post('/force-migration', adminOnly, async (req, res) => {
    try {
        const migrationFile = path.join(__dirname, '../db/migrations/011_variants_system.sql');
        
        if (!fs.existsSync(migrationFile)) {
            return res.status(404).json({ error: 'Migration file not found' });
        }
        
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        // Run the migration - IF NOT EXISTS makes it idempotent
        await pool.query(sql);
        
        // Verify tables were created
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('attributes', 'attribute_options', 'product_variants', 'variant_attributes', 'product_attributes')
            ORDER BY table_name
        `);
        
        const createdTables = result.rows.map(r => r.table_name);
        
        res.json({ 
            success: true, 
            message: 'Migration 011 executed (idempotent)',
            tables_found: createdTables,
            all_tables_exist: createdTables.length === 5
        });
    } catch (error) {
        console.error('Migration error:', error);
        
        res.status(500).json({ 
            error: 'Migration failed', 
            details: error.message 
        });
    }
});

// GET /api/admin/migration-status - Check if migration 011 is applied
router.get('/migration-status', adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'attributes'
            );
        `);
        
        const isApplied = result.rows[0].exists;
        
        res.json({
            migration_011_applied: isApplied,
            message: isApplied ? 'Migration 011 is applied' : 'Migration 011 is NOT applied'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

