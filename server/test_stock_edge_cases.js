require('dotenv').config();
const http = require('http');
const pool = require('./db/pool');

const BASE_HOST = '127.0.0.1';
const BASE_PORT = 5000;
let token = '';
let productId = '';
let passed = 0;
let failed = 0;

function check(label, condition) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.log(`  ❌ ${label}`);
        failed++;
    }
}

function request(method, path, body, authToken) {
    return new Promise((resolve, reject) => {
        const headers = {};
        let data = null;
        if (body) {
            data = JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(data);
        }
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const options = {
            hostname: BASE_HOST,
            port: BASE_PORT,
            path: path,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(responseData); } catch (e) { /* not json */ }
                resolve({ status: res.statusCode, data: json, raw: responseData });
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

async function test() {
    try {
        // ── Login ──
        console.log('=== Login ===');
        const loginRes = await request('POST', '/api/auth/login', {
            email: 'admin@furniture-store.com',
            password: 'admin123'
        });
        token = loginRes.data?.token;
        check('Login successful', loginRes.status === 200 && !!token);

        // ── Get a product ID ──
        const listRes = await request('GET', '/api/admin/products', null, token);
        productId = listRes.data?.products?.[0]?.id;
        console.log(`Using product: ${listRes.data?.products?.[0]?.name} (${productId})`);

        // ═══════════════════════════════════════════════════════
        // TEST 1: Low Stock Endpoint (correct path)
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 1: Low Stock Endpoint ===');

        // First, set a product to non-configurable with low stock
        await request('PUT', `/api/admin/products/${productId}`, {
            is_configurable: false,
            stock_quantity: 3,
            stock_status: 'low_stock',
            low_stock_threshold: 10
        }, token);

        const lowStockRes = await request('GET', '/api/admin/inventory/low-stock?threshold=10', null, token);
        check('Low stock endpoint returns 200', lowStockRes.status === 200);
        check('Low stock has total field', typeof lowStockRes.data?.total === 'number');
        check('Low stock has lowStock array', Array.isArray(lowStockRes.data?.lowStock));
        check('Low stock includes our product', lowStockRes.data?.lowStock?.some(item => item.product_id === productId));

        if (lowStockRes.data?.lowStock?.length > 0) {
            const item = lowStockRes.data.lowStock.find(i => i.product_id === productId);
            if (item) {
                check('Low stock item has stock_type=product', item.stock_type === 'product');
                check('Low stock item has stock_quantity=3', item.stock_quantity === 3);
                check('Low stock item has product_name', !!item.product_name);
            }
        }

        // ═══════════════════════════════════════════════════════
        // TEST 2: Stock Status Constraint Validation
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 2: Stock Status Values ===');

        // Valid statuses
        for (const status of ['in_stock', 'low_stock', 'out_of_stock']) {
            const res = await request('PUT', `/api/admin/products/${productId}`, {
                stock_status: status
            }, token);
            check(`stock_status="${status}" accepted (${res.status})`, res.status === 200);
        }

        // Invalid status should fail (DB CHECK constraint)
        const invalidStatusRes = await request('PUT', `/api/admin/products/${productId}`, {
            stock_status: 'invalid_status'
        }, token);
        check('Invalid stock_status rejected', invalidStatusRes.status !== 200);

        // ═══════════════════════════════════════════════════════
        // TEST 3: Stock Quantity Edge Cases
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 3: Stock Quantity Edge Cases ===');

        // Set stock to 0
        const zeroRes = await request('PUT', `/api/admin/products/${productId}`, {
            stock_quantity: 0,
            stock_status: 'out_of_stock'
        }, token);
        check('Stock quantity 0 accepted', zeroRes.status === 200);
        check('Stock quantity 0 saved correctly', zeroRes.data?.product?.stock_quantity === 0);

        // Set stock to large number
        const largeRes = await request('PUT', `/api/admin/products/${productId}`, {
            stock_quantity: 99999,
            stock_status: 'in_stock'
        }, token);
        check('Large stock quantity accepted', largeRes.status === 200);
        check('Large stock quantity saved', largeRes.data?.product?.stock_quantity === 99999);

        // ═══════════════════════════════════════════════════════
        // TEST 4: Dashboard Low Stock Count
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 4: Dashboard Low Stock Count ===');

        // Set product to low stock (qty=2, threshold=10)
        await request('PUT', `/api/admin/products/${productId}`, {
            is_configurable: false,
            stock_quantity: 2,
            stock_status: 'low_stock',
            low_stock_threshold: 10
        }, token);

        const dashRes = await request('GET', '/api/admin/dashboard', null, token);
        check('Dashboard returns 200', dashRes.status === 200);
        check('Dashboard has stats', !!dashRes.data?.stats);
        check('Dashboard low_stock_count >= 1', dashRes.data?.stats?.low_stock_count >= 1);
        console.log(`  Dashboard low_stock_count: ${dashRes.data?.stats?.low_stock_count}`);

        // ═══════════════════════════════════════════════════════
        // TEST 5: Configurable Product Stock Isolation
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 5: Configurable Product Stock Isolation ===');

        // Set back to configurable
        await request('PUT', `/api/admin/products/${productId}`, {
            is_configurable: true
        }, token);

        const configDetailRes = await request('GET', `/api/admin/products/${productId}`, null, token);
        check('Configurable product detail returns 200', configDetailRes.status === 200);
        check('is_configurable is true', configDetailRes.data?.product?.is_configurable === true);
        check('configuration_options key exists', Array.isArray(configDetailRes.data?.product?.configuration_options));

        // ═══════════════════════════════════════════════════════
        // TEST 6: Low Stock Threshold Update
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 6: Low Stock Threshold ===');

        await request('PUT', `/api/admin/products/${productId}`, {
            is_configurable: false,
            low_stock_threshold: 20,
            stock_quantity: 15
        }, token);

        const threshRes = await request('GET', `/api/admin/products/${productId}`, null, token);
        check('Low stock threshold updated to 20', threshRes.data?.product?.low_stock_threshold === 20);
        check('Stock quantity is 15', threshRes.data?.product?.stock_quantity === 15);

        // This product (qty=15, threshold=20) should appear in low stock
        const lowStock2Res = await request('GET', '/api/admin/inventory/low-stock?threshold=20', null, token);
        check('Product with qty<threshold appears in low stock', lowStock2Res.data?.lowStock?.some(i => i.product_id === productId));

        // ═══════════════════════════════════════════════════════
        // TEST 7: Error Paths
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 7: Error Paths ===');

        // Invalid product ID
        const invalidIdRes = await request('GET', '/api/admin/products/00000000-0000-0000-0000-000000000000', null, token);
        check('Invalid product ID returns 404', invalidIdRes.status === 404);

        // No auth token
        const noAuthRes = await request('GET', `/api/admin/products/${productId}`);
        check('No auth token returns 401', noAuthRes.status === 401);

        // Non-UUID product ID
        const badIdRes = await request('GET', '/api/admin/products/not-a-uuid', null, token);
        check('Non-UUID product ID handled gracefully', badIdRes.status === 400 || badIdRes.status === 404 || badIdRes.status === 500);

        // Empty body update
        const emptyRes = await request('PUT', `/api/admin/products/${productId}`, {}, token);
        check('Empty body update handled', emptyRes.status === 200 || emptyRes.status === 400);

        // ═══════════════════════════════════════════════════════
        // TEST 8: Inventory Adjust Endpoint
        // ═══════════════════════════════════════════════════════
        console.log('\n=== TEST 8: Inventory Adjust Endpoint ===');

        const { rows: configValues } = await pool.query(
            'SELECT cv.id FROM configuration_values cv LIMIT 1'
        );
        if (configValues.length > 0) {
            const cvId = configValues[0].id;
            const adjustRes = await request('POST', '/api/admin/inventory/adjust', {
                valueId: cvId,
                adjustment: 5,
                reason: 'Test adjustment'
            }, token);
            check(`Inventory adjust endpoint responds (${adjustRes.status})`, adjustRes.status === 200 || adjustRes.status === 400);
        } else {
            console.log('  ⏭️  No configuration values to test adjust endpoint');
        }

        // ═══════════════════════════════════════════════════════
        // CLEANUP: Revert product to configurable
        // ═══════════════════════════════════════════════════════
        console.log('\n=== Cleanup ===');
        const cleanupRes = await request('PUT', `/api/admin/products/${productId}`, {
            is_configurable: true,
            stock_quantity: 0,
            stock_status: 'in_stock',
            low_stock_threshold: 5
        }, token);
        check('Cleanup: reverted product', cleanupRes.status === 200);

        // ═══════════════════════════════════════════════════════
        // SUMMARY
        // ═══════════════════════════════════════════════════════
        console.log(`\n${'='.repeat(50)}`);
        console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
        console.log(`${'='.repeat(50)}`);

        await pool.end();
        process.exit(failed > 0 ? 1 : 0);
    } catch (e) {
        console.error('Test error:', e.message, e.stack);
        await pool.end();
        process.exit(1);
    }
}

test();
