const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.test BEFORE requiring app or pool, and force override
dotenv.config({ path: path.join(__dirname, '../.env.test'), override: true });

const pool = require('../db/pool');
const { Client } = require('pg');

// Set global timeout to 30s to allow for database schema creation
jest.setTimeout(30000);

// We drop tracking of test time to spot slow endpoints
let testStartTime;

beforeAll(async () => {
    // Only run schema init ONCE per test process (important for --runInBand)
    if (global.__SCHEMA_INITIALIZED__) {
        // Still truncate to ensure clean state for this suite
        await pool.query('TRUNCATE users, categories, products, orders, cart_items RESTART IDENTITY CASCADE');
        return;
    }

    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    try {
        await pool.query(schemaSql);
        // Ensure clean start for first suite
        await pool.query('TRUNCATE users, categories, products, orders, cart_items RESTART IDENTITY CASCADE');
        global.__SCHEMA_INITIALIZED__ = true;
        console.log('Test database schema globally initialized.');
    } catch (error) {
        console.error('Error executing schema.sql in beforeAll:', error);
        throw error;
    }
});

beforeEach(async () => {
    testStartTime = Date.now();
});

afterEach(() => {
    const duration = Date.now() - testStartTime;
    if (duration > 1000) {
        console.warn(`⚠️ Slow test detected: ${expect.getState().currentTestName} (${duration}ms)`);
    }
});

// After all tests are done, close the connection pool
afterAll(async () => {
    await pool.end();
});
