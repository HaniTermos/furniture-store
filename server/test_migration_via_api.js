#!/usr/bin/env node
/**
 * Run Migration 011 via Server API
 * This uses the running server's migration endpoint
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

// Admin credentials
const TEST_EMAIL = 'admin@furniture-store.com';
const TEST_PASSWORD = 'admin123';

let authToken = null;

function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve({ status: res.statusCode, data });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function login() {
    console.log('🔐 Logging in as admin...');
    const res = await makeRequest('/api/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });
    
    if (res.status !== 200) {
        throw new Error(`Login failed: ${res.data.error || 'Unknown error'}`);
    }
    
    authToken = res.data.token;
    console.log('✅ Logged in successfully\n');
}

async function checkMigrationStatus() {
    console.log('📊 Checking migration status...');
    const res = await makeRequest('/api/admin/migration-status', 'GET', null, authToken);
    console.log('Status:', res.data);
    return res.data.migration_011_applied;
}

async function runMigration() {
    console.log('\n🚀 Running migration 011...');
    const res = await makeRequest('/api/admin/force-migration', 'POST', {}, authToken);
    console.log('Result:', res.data);
    return res.data.success;
}

async function testAttributesEndpoint() {
    console.log('\n📋 Testing /api/attributes endpoint...');
    const res = await makeRequest('/api/attributes');
    console.log('Status:', res.status);
    if (res.status === 200) {
        console.log('✅ Attributes endpoint working!');
        console.log('Found', res.data.length, 'attributes');
    } else {
        console.log('❌ Error:', res.data);
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('  🔄 Migration 011 Runner (via Server API)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Check if server is running
        console.log('🔍 Checking server...');
        try {
            const health = await makeRequest('/health');
            if (health.status === 200) {
                console.log('✅ Server is running on port 5000\n');
            }
        } catch (err) {
            console.error('❌ Server is not running. Please start it first:');
            console.error('   cd server && npm run dev\n');
            process.exit(1);
        }

        await login();
        
        const isApplied = await checkMigrationStatus();
        
        // Always run force-migration to ensure tables exist
        console.log('\n🚀 Running force migration (idempotent)...');
        const success = await runMigration();
        if (success) {
            console.log('\n✅ Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration may have failed or partially applied.');
        }

        // Test the attributes endpoint
        await testAttributesEndpoint();

        console.log('\n═══════════════════════════════════════════════════════════\n');
        console.log('  ✅ Done!\n');
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

main();

