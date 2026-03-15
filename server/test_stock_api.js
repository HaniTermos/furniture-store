require('dotenv').config();
const pool = require('./db/pool');

const BASE = 'http://localhost:5000';

async function test() {
    try {
        // 1. Login
        console.log('=== 1. Login ===');
        const loginRes = await fetch(`${BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@furniture-store.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        console.log('Login status:', loginRes.status);
        if (!loginData.token) { console.error('No token!', loginData); process.exit(1); }
        const token = loginData.token;
        console.log('Token obtained ✅');

        // 2. Get products list
        console.log('\n=== 2. Get Products List ===');
        const listRes = await fetch(`${BASE}/api/admin/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        console.log('Products count:', listData.products?.length || 0);
        const firstProduct = listData.products?.[0];
        if (!firstProduct) { console.error('No products found!'); process.exit(1); }
        console.log('First product:', firstProduct.name, '| ID:', firstProduct.id);

        // 3. Get product detail (check stock fields returned)
        console.log('\n=== 3. Get Product Detail ===');
        const detailRes = await fetch(`${BASE}/api/admin/products/${firstProduct.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const detailData = await detailRes.json();
        console.log('Detail status:', detailRes.status);
        const p = detailData.product;
        console.log('  name:', p.name);
        console.log('  is_configurable:', p.is_configurable);
        console.log('  stock_quantity:', p.stock_quantity);
        console.log('  stock_status:', p.stock_status);
        console.log('  low_stock_threshold:', p.low_stock_threshold);
        console.log('  images count:', p.images?.length);
        console.log('  configurations count:', p.configurations?.length);

        // 4. Update product stock (set is_configurable=false, stock_quantity=25)
        console.log('\n=== 4. Update Product Stock ===');
        const updateRes = await fetch(`${BASE}/api/admin/products/${firstProduct.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                is_configurable: false,
                stock_quantity: 25,
                stock_status: 'in_stock',
                low_stock_threshold: 10
            })
        });
        const updateData = await updateRes.json();
        console.log('Update status:', updateRes.status);
        if (updateRes.status === 200) {
            const up = updateData.product;
            console.log('  Updated is_configurable:', up.is_configurable);
            console.log('  Updated stock_quantity:', up.stock_quantity);
            console.log('  Updated stock_status:', up.stock_status);
            console.log('  Updated low_stock_threshold:', up.low_stock_threshold);
        } else {
            console.error('Update failed:', JSON.stringify(updateData));
        }

        // 5. Verify via detail again
        console.log('\n=== 5. Verify Update ===');
        const verifyRes = await fetch(`${BASE}/api/admin/products/${firstProduct.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const verifyData = await verifyRes.json();
        const vp = verifyData.product;
        console.log('  stock_quantity:', vp.stock_quantity, vp.stock_quantity === 25 ? '✅' : '❌');
        console.log('  stock_status:', vp.stock_status, vp.stock_status === 'in_stock' ? '✅' : '❌');
        console.log('  low_stock_threshold:', vp.low_stock_threshold, vp.low_stock_threshold === 10 ? '✅' : '❌');
        console.log('  is_configurable:', vp.is_configurable, vp.is_configurable === false ? '✅' : '❌');

        // 6. Revert back to configurable
        console.log('\n=== 6. Revert to Configurable ===');
        const revertRes = await fetch(`${BASE}/api/admin/products/${firstProduct.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_configurable: true })
        });
        console.log('Revert status:', revertRes.status, revertRes.status === 200 ? '✅' : '❌');

        // 7. Test low stock endpoint
        console.log('\n=== 7. Low Stock Endpoint ===');
        const lowStockRes = await fetch(`${BASE}/api/admin/low-stock?threshold=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const lowStockData = await lowStockRes.json();
        console.log('Low stock status:', lowStockRes.status);
        console.log('Low stock items:', lowStockData.total);
        if (lowStockData.lowStock?.length > 0) {
            lowStockData.lowStock.slice(0, 3).forEach(item => {
                console.log(`  - ${item.product_name} (${item.stock_type}): ${item.stock_quantity}`);
            });
        }

        // 8. Test invalid product ID
        console.log('\n=== 8. Invalid Product ID ===');
        const invalidRes = await fetch(`${BASE}/api/admin/products/00000000-0000-0000-0000-000000000000`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Invalid ID status:', invalidRes.status, invalidRes.status === 404 ? '✅' : '❌');

        // 9. Test unauthorized access
        console.log('\n=== 9. Unauthorized Access ===');
        const unauthRes = await fetch(`${BASE}/api/admin/products/${firstProduct.id}`);
        console.log('No token status:', unauthRes.status, unauthRes.status === 401 ? '✅' : '❌');

        // 10. Dashboard endpoint (check low_stock_count)
        console.log('\n=== 10. Dashboard Stats ===');
        const dashRes = await fetch(`${BASE}/api/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashData = await dashRes.json();
        console.log('Dashboard status:', dashRes.status);
        console.log('  low_stock_count:', dashData.stats?.low_stock_count);

        console.log('\n✅ All API tests completed!');
        await pool.end();
    } catch (e) {
        console.error('Test error:', e.message);
        await pool.end();
    }
}

test();
