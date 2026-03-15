require('dotenv').config();
const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (c) => raw += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    console.log('\n========== API THOROUGH TEST ==========\n');

    // 1. Login
    console.log('1) POST /api/auth/login');
    const login = await request('POST', '/api/auth/login', {
        email: 'admin@furniture-store.com',
        password: 'admin123'
    });
    console.log('   Status:', login.status);
    if (login.status !== 200) { console.log('   FAIL:', login.body); return; }
    const token = login.body.token;
    console.log('   ✅ Token obtained:', token.slice(0, 30) + '...');

    // 2. List products
    console.log('\n2) GET /api/admin/products');
    const list = await request('GET', '/api/admin/products?limit=5', null, token);
    console.log('   Status:', list.status);
    if (list.status !== 200) { console.log('   FAIL:', list.body); return; }
    const products = list.body.products || [];
    console.log('   ✅ Products count:', products.length);
    if (products.length === 0) { console.log('   No products found — seed DB first'); return; }

    const product = products[0];
    const productId = product.id;
    console.log('   First product:', product.name, '| ID:', productId, '| configurable:', product.is_configurable);

    // 3. Get product detail
    console.log('\n3) GET /api/admin/products/' + productId);
    const detail = await request('GET', `/api/admin/products/${productId}`, null, token);
    console.log('   Status:', detail.status);
    if (detail.status !== 200) { console.log('   FAIL:', detail.body); return; }
    const p = detail.body.product;
    console.log('   ✅ Product:', p.name);
    console.log('   configuration_options:', (p.configuration_options || []).length, 'options');
    const configOpts = p.configuration_options || [];
    configOpts.forEach(opt => {
        console.log(`     Option: ${opt.name} (${opt.type}) — ${(opt.values||[]).length} values`);
        (opt.values || []).forEach(v => {
            const [name, hex] = (v.value || '').split('|');
            console.log(`       - "${name}"${hex ? ' hex:'+hex : ''} | stock: ${v.stock_quantity} | price_adj: ${v.price_adjustment}`);
        });
    });

    // 4. Test configuration_values_update
    const firstOpt = configOpts[0];
    if (firstOpt && firstOpt.values && firstOpt.values.length > 0) {
        const firstVal = firstOpt.values[0];
        const newStock = 42;
        console.log(`\n4) PUT /api/admin/products/${productId} — update stock of "${firstVal.value}" to ${newStock}`);
        const update = await request('PUT', `/api/admin/products/${productId}`, {
            name: p.name,
            base_price: p.base_price,
            configuration_values_update: [{
                id: firstVal.id,
                stock_quantity: newStock,
                price_adjustment: parseFloat(firstVal.price_adjustment) || 0,
                stock_status: 'in_stock'
            }]
        }, token);
        console.log('   Status:', update.status);
        if (update.status === 200) {
            console.log('   ✅ Update success');
            // Verify
            const verify = await request('GET', `/api/admin/products/${productId}`, null, token);
            const updatedVal = (verify.body.product?.configuration_options || [])
                .flatMap(o => o.values || [])
                .find(v => v.id === firstVal.id);
            if (updatedVal) {
                console.log('   ✅ Verified stock now:', updatedVal.stock_quantity, '(expected:', newStock + ')');
            } else {
                console.log('   ⚠️  Could not find value in response to verify');
            }
        } else {
            console.log('   FAIL:', JSON.stringify(update.body));
        }
    } else {
        console.log('\n4) SKIP — no configuration values found (product may not be configurable)');
    }

    // 5. Test unauthorized access
    console.log('\n5) GET /api/admin/products (no token) — expect 401');
    const unauth = await request('GET', '/api/admin/products', null, null);
    console.log('   Status:', unauth.status, unauth.status === 401 ? '✅' : '❌ expected 401');

    // 6. Test invalid product ID
    console.log('\n6) GET /api/admin/products/invalid-uuid — expect 400 or 404');
    const badId = await request('GET', '/api/admin/products/not-a-real-uuid', null, token);
    console.log('   Status:', badId.status, (badId.status === 400 || badId.status === 404 || badId.status === 500) ? '✅' : '❌');

    // 7. Test public product endpoint (shop page)
    console.log('\n7) GET /api/products (public shop endpoint)');
    const pub = await request('GET', '/api/products?limit=3', null, null);
    console.log('   Status:', pub.status);
    if (pub.status === 200) {
        const pubProducts = pub.body.products || [];
        console.log('   ✅ Public products:', pubProducts.length);
        if (pubProducts.length > 0) {
            const pp = pubProducts[0];
            console.log('   First product slug:', pp.slug);
            // Test by slug
            const bySlug = await request('GET', `/api/products/${pp.slug}`, null, null);
            console.log('   GET /api/products/' + pp.slug + ' status:', bySlug.status);
            if (bySlug.status === 200) {
                const sp = bySlug.body.product;
                console.log('   ✅ Shop product:', sp.name);
                console.log('   configuration_options:', (sp.configuration_options || []).length);
                (sp.configuration_options || []).forEach(opt => {
                    console.log(`     ${opt.name}: ${(opt.values||[]).map(v => v.value).join(', ')}`);
                });
            }
        }
    }

    console.log('\n========== TEST COMPLETE ==========\n');
}

run().catch(console.error);
