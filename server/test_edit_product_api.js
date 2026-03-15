// ═══════════════════════════════════════════════════════════════
//  test_edit_product_api.js — Thorough API test for Edit Product
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const http = require('http');

let TOKEN = '';
let TEST_PRODUCT_ID = '';

// ─── HTTP helper ─────────────────────────────────────────────
function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'localhost',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: 'Bearer ' + token } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const req = http.request(opts, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
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

// ─── Test runner ─────────────────────────────────────────────
let passed = 0, failed = 0;
async function test(name, fn) {
    try {
        await fn();
        console.log('  ✅ ' + name);
        passed++;
    } catch (err) {
        console.log('  ❌ ' + name + ': ' + err.message);
        failed++;
    }
}
function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

// ═══════════════════════════════════════════════════════════════
async function runTests() {
    console.log('\n🧪 Edit Product API — Thorough Test Suite\n');

    // ── 1. Auth ──────────────────────────────────────────────
    console.log('── 1. Authentication ──');

    await test('Login with admin credentials', async () => {
        const r = await request('POST', '/api/auth/login', {
            email: 'admin@furniture-store.com',
            password: 'admin123'
        });
        assert(r.status === 200, 'Expected 200, got ' + r.status + ': ' + JSON.stringify(r.body));
        assert(r.body.token, 'No token in response');
        TOKEN = r.body.token;
        console.log('     → Token acquired');
    });

    await test('Reject login with wrong password', async () => {
        const r = await request('POST', '/api/auth/login', {
            email: 'admin@furniture-store.com',
            password: 'wrongpassword'
        });
        assert(r.status === 401 || r.status === 400, 'Expected 401/400, got ' + r.status);
    });

    // ── 2. GET /api/admin/products (list) ────────────────────
    console.log('\n── 2. Admin Products List ──');

    await test('GET /api/admin/products returns list', async () => {
        const r = await request('GET', '/api/admin/products', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status + ': ' + JSON.stringify(r.body));
        assert(Array.isArray(r.body.products), 'Expected products array');
        if (r.body.products.length > 0) {
            TEST_PRODUCT_ID = r.body.products[0].id;
            console.log('     → Using product: "' + r.body.products[0].name + '" (' + TEST_PRODUCT_ID + ')');
        }
    });

    await test('GET /api/admin/products rejects unauthenticated', async () => {
        const r = await request('GET', '/api/admin/products', null, null);
        assert(r.status === 401 || r.status === 403, 'Expected 401/403, got ' + r.status);
    });

    await test('GET /api/admin/products supports search param', async () => {
        const r = await request('GET', '/api/admin/products?search=chair', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body.products), 'Expected products array');
        console.log('     → Search "chair" returned ' + r.body.products.length + ' results');
    });

    // ── 3. GET /api/admin/products/:id (detail) ──────────────
    console.log('\n── 3. Admin Product Detail ──');

    await test('GET /api/admin/products/:id returns full product shape', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available — seed the DB first');
        const r = await request('GET', '/api/admin/products/' + TEST_PRODUCT_ID, null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status + ': ' + JSON.stringify(r.body));
        const p = r.body.product;
        assert(p, 'No product in response');
        assert(p.id, 'Missing product.id');
        assert(p.name, 'Missing product.name');
        assert(p.base_price !== undefined, 'Missing product.base_price');
        assert(Array.isArray(p.images), 'Missing product.images array');
        assert(Array.isArray(p.configuration_options), 'Missing product.configuration_options array');
        assert(Array.isArray(p.tags), 'Missing product.tags array');
        assert(Array.isArray(p.attributes), 'Missing product.attributes array');
        console.log('     → images:' + p.images.length + ' config_opts:' + p.configuration_options.length + ' tags:' + p.tags.length + ' attrs:' + p.attributes.length);
    });

    await test('GET /api/admin/products/:id returns 404 for non-existent ID', async () => {
        const r = await request('GET', '/api/admin/products/00000000-0000-0000-0000-000000000000', null, TOKEN);
        assert(r.status === 404, 'Expected 404, got ' + r.status);
    });

    await test('GET /api/admin/products/:id rejects unauthenticated', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('GET', '/api/admin/products/' + TEST_PRODUCT_ID, null, null);
        assert(r.status === 401 || r.status === 403, 'Expected 401/403, got ' + r.status);
    });

    // ── 4. PUT /api/admin/products/:id (update) ──────────────
    console.log('\n── 4. Admin Product Update ──');

    let originalName = '';
    let originalPrice = 0;

    await test('Capture original product state', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('GET', '/api/admin/products/' + TEST_PRODUCT_ID, null, TOKEN);
        originalName = r.body.product.name;
        originalPrice = parseFloat(r.body.product.base_price);
        assert(originalName, 'Could not get original name');
        console.log('     → Original: "' + originalName + '" @ $' + originalPrice);
    });

    await test('PUT updates name field', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const newName = originalName + ' [EDITED]';
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { name: newName }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status + ': ' + JSON.stringify(r.body));
        assert(r.body.product.name === newName, 'Name not updated: got "' + r.body.product.name + '"');
    });

    await test('PUT restores original name', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { name: originalName }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(r.body.product.name === originalName, 'Name not restored');
    });

    await test('PUT returns full product shape (images, config_options, tags, attributes)', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { is_featured: false }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        const p = r.body.product;
        assert(Array.isArray(p.images), 'Missing images in update response');
        assert(Array.isArray(p.configuration_options), 'Missing configuration_options in update response');
        assert(Array.isArray(p.tags), 'Missing tags in update response');
        assert(Array.isArray(p.attributes), 'Missing attributes in update response');
    });

    await test('PUT updates price', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { base_price: 777.77 }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(parseFloat(r.body.product.base_price) === 777.77, 'Price not updated: got ' + r.body.product.base_price);
        // Restore
        await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { base_price: originalPrice }, TOKEN);
    });

    await test('PUT updates SEO fields', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, {
            meta_title: 'Test SEO Title',
            meta_description: 'Test SEO description'
        }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(r.body.product.meta_title === 'Test SEO Title', 'meta_title not updated');
    });

    await test('PUT syncs tags (empty array clears all tags)', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { tags: [] }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body.product.tags), 'Tags not returned');
        assert(r.body.product.tags.length === 0, 'Expected 0 tags after clearing');
    });

    await test('PUT syncs tags (assign available tags)', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const tagsR = await request('GET', '/api/admin/tags', null, TOKEN);
        const tags = Array.isArray(tagsR.body) ? tagsR.body : [];
        const tagIds = tags.slice(0, 2).map(t => t.id);
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { tags: tagIds }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(r.body.product.tags.length === tagIds.length, 'Expected ' + tagIds.length + ' tags, got ' + r.body.product.tags.length);
        console.log('     → Assigned ' + tagIds.length + ' tags successfully');
    });

    await test('PUT syncs images (empty array removes all images)', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { images: [] }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body.product.images), 'Images not returned');
        assert(r.body.product.images.length === 0, 'Expected 0 images after clearing');
    });

    await test('PUT syncs images (insert new temp image)', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, {
            images: [
                { id: 'temp-123', image_url: 'https://example.com/test.jpg', is_primary: true, sort_order: 0 }
            ]
        }, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(r.body.product.images.length === 1, 'Expected 1 image, got ' + r.body.product.images.length);
        assert(r.body.product.images[0].is_primary === true, 'Expected is_primary=true');
        console.log('     → New image inserted with ID: ' + r.body.product.images[0].id);
    });

    // ── 5. Error paths ───────────────────────────────────────
    console.log('\n── 5. Error Paths ──');

    await test('PUT /api/admin/products/:id returns 404 for non-existent ID', async () => {
        const r = await request('PUT', '/api/admin/products/00000000-0000-0000-0000-000000000000', {
            name: 'Ghost Product'
        }, TOKEN);
        assert(r.status === 404, 'Expected 404, got ' + r.status);
    });

    await test('PUT /api/admin/products/:id rejects unauthenticated', async () => {
        if (!TEST_PRODUCT_ID) throw new Error('No product ID available');
        const r = await request('PUT', '/api/admin/products/' + TEST_PRODUCT_ID, { name: 'Hack' }, null);
        assert(r.status === 401 || r.status === 403, 'Expected 401/403, got ' + r.status);
    });

    // ── 6. Supporting endpoints ──────────────────────────────
    console.log('\n── 6. Supporting Admin Endpoints ──');

    await test('GET /api/admin/tags returns array', async () => {
        const r = await request('GET', '/api/admin/tags', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body), 'Expected array, got ' + typeof r.body);
        console.log('     → ' + r.body.length + ' tags available');
    });

    await test('GET /api/admin/attributes returns array', async () => {
        const r = await request('GET', '/api/admin/attributes', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body), 'Expected array, got ' + typeof r.body);
        console.log('     → ' + r.body.length + ' attributes available');
    });

    await test('GET /api/categories returns array', async () => {
        const r = await request('GET', '/api/categories', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body), 'Expected array, got ' + typeof r.body);
        console.log('     → ' + r.body.length + ' categories available');
    });

    await test('GET /api/admin/size-guides returns array', async () => {
        const r = await request('GET', '/api/admin/size-guides', null, TOKEN);
        assert(r.status === 200, 'Expected 200, got ' + r.status);
        assert(Array.isArray(r.body), 'Expected array, got ' + typeof r.body);
    });

    // ── Summary ──────────────────────────────────────────────
    console.log('\n' + '═'.repeat(50));
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' tests');
    if (failed === 0) {
        console.log('🎉 All tests passed!\n');
    } else {
        console.log('⚠️  Some tests failed — review above\n');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
