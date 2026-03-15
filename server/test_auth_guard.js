require('dotenv').config();
const http = require('http');

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function run() {
    console.log('\n=== Auth Guard Tests ===\n');

    // 1. GET /auth/me without token → should be 401
    const r1 = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET' });
    console.log('1. GET /auth/me (no token):', r1.status, r1.status === 401 ? '✅ PASS' : '❌ FAIL');

    // 2. Login as admin to get a valid token
    const loginBody = JSON.stringify({ email: 'admin@furniture-store.com', password: 'admin123' });
    const r2 = await request({
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
    }, loginBody);
    console.log('2. POST /auth/login (admin):', r2.status, r2.status === 200 ? '✅ PASS' : '❌ FAIL');

    if (r2.status !== 200) {
        console.log('   Error:', r2.body);
        return;
    }

    const token = r2.body.token;
    console.log('   Token obtained:', token ? '✅ yes' : '❌ no');

    // 3. GET /auth/me with valid token → should be 200
    const r3 = await request({
        hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('3. GET /auth/me (valid token):', r3.status, r3.status === 200 ? '✅ PASS' : '❌ FAIL');
    if (r3.status === 200) {
        console.log('   User role:', r3.body.user?.role);
    }

    // 4. GET /auth/me with fake/expired token → should be 401
    const r4 = await request({
        hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET',
        headers: { 'Authorization': 'Bearer fake.expired.token' }
    });
    console.log('4. GET /auth/me (fake token):', r4.status, r4.status === 401 ? '✅ PASS' : '❌ FAIL');

    // 5. Login as regular customer → should not access admin
    const custBody = JSON.stringify({ email: 'customer@example.com', password: 'customer123' });
    const r5 = await request({
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(custBody) }
    }, custBody);
    console.log('5. POST /auth/login (customer):', r5.status, r5.status === 200 ? '✅ PASS' : '⚠️  no customer account');

    if (r5.status === 200) {
        const custToken = r5.body.token;
        const r5b = await request({
            hostname: 'localhost', port: 5000, path: '/api/admin/dashboard', method: 'GET',
            headers: { 'Authorization': `Bearer ${custToken}` }
        });
        console.log('   GET /admin/dashboard (customer token):', r5b.status, r5b.status === 403 ? '✅ PASS (403 Forbidden)' : `⚠️  got ${r5b.status}`);
    }

    console.log('\n=== Done ===\n');
}

run().catch(console.error);
