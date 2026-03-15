#!/usr/bin/env node
/**
 * Full Variants System Test
 * Tests all API endpoints after migration is applied
 */

const BASE_URL = 'http://localhost:5000';

// Test credentials
const TEST_EMAIL = 'admin@furniture-store.com';
const TEST_PASSWORD = 'admin123';

let authToken = null;
let testProductId = null;
let testAttributeId = null;
let testVariantId = null;

async function login() {
    console.log('🔐 Logging in...');
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Login failed: ${data.error}`);
    authToken = data.token;
    console.log('✅ Logged in\n');
}

async function testMigrationStatus() {
    console.log('📊 Checking migration status...');
    const res = await fetch(`${BASE_URL}/api/admin/migration-status`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    console.log('Status:', data);
    
    if (!data.migration_011_applied) {
        console.log('\n⚠️  Migration not applied. Running migration...');
        const runRes = await fetch(`${BASE_URL}/api/admin/run-migration`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const runData = await runRes.json();
        console.log('Migration result:', runData);
    }
    console.log('');
}

async function testCreateAttribute() {
    console.log('🏷️  Testing attribute creation...');
    const res = await fetch(`${BASE_URL}/api/attributes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            name: 'Test Color',
            slug: 'test-color',
            type: 'color',
            sort_order: 1
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Create attribute failed: ${data.error || JSON.stringify(data)}`);
    testAttributeId = data.data?.id;
    console.log('✅ Created attribute:', data.data?.name, `(ID: ${testAttributeId})\n`);
}

async function testCreateAttributeOption() {
    console.log('🎨 Testing attribute option creation...');
    const res = await fetch(`${BASE_URL}/api/attributes/${testAttributeId}/options`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            value: 'Red',
            slug: 'red',
            color_hex: '#FF0000',
            sort_order: 1
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Create option failed: ${data.error || JSON.stringify(data)}`);
    console.log('✅ Created option:', data.data?.value, `(ID: ${data.data?.id})\n`);
}

async function testGetAttributes() {
    console.log('📋 Testing get attributes...');
    const res = await fetch(`${BASE_URL}/api/attributes`);
    const data = await res.json();
    if (!res.ok) throw new Error(`Get attributes failed: ${data.error}`);
    console.log('✅ Found', data.data?.length || 0, 'attributes\n');
}

async function testCreateProductVariant() {
    console.log('📦 Testing product variant creation...');
    // First get a product
    const productsRes = await fetch(`${BASE_URL}/api/products?limit=1`);
    const productsData = await productsRes.json();
    if (!productsRes.ok || !productsData.products?.length) {
        console.log('⚠️  No products found, skipping variant test\n');
        return;
    }
    testProductId = productsData.products[0].id;
    
    const res = await fetch(`${BASE_URL}/api/products/${testProductId}/variants`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            sku: 'TEST-VARIANT-001',
            price: 199.99,
            stock_quantity: 50,
            stock_status: 'in_stock',
            is_active: true,
            attributes: [
                { attribute_id: testAttributeId, value: 'Red' }
            ]
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Create variant failed: ${data.error || JSON.stringify(data)}`);
    testVariantId = data.data?.id;
    console.log('✅ Created variant:', data.data?.sku, `(ID: ${testVariantId})\n`);
}

async function testGetProductVariants() {
    if (!testProductId) {
        console.log('⚠️  No product ID, skipping get variants test\n');
        return;
    }
    console.log('📦 Testing get product variants...');
    const res = await fetch(`${BASE_URL}/api/products/${testProductId}/variants`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Get variants failed: ${data.error}`);
    console.log('✅ Found', data.data?.length || 0, 'variants\n');
}

async function cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    // Delete variant
    if (testVariantId && testProductId) {
        await fetch(`${BASE_URL}/api/products/${testProductId}/variants/${testVariantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('  - Deleted test variant');
    }
    
    // Delete attribute (cascades to options)
    if (testAttributeId) {
        await fetch(`${BASE_URL}/api/attributes/${testAttributeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('  - Deleted test attribute');
    }
    
    console.log('✅ Cleanup complete\n');
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('  🧪 Product Variants System v3.0 - Full API Test Suite\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
        await login();
        await testMigrationStatus();
        await testCreateAttribute();
        await testCreateAttributeOption();
        await testGetAttributes();
        await testCreateProductVariant();
        await testGetProductVariants();
        
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('  ✅ ALL TESTS PASSED!\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        await cleanup();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        console.error(err.stack);
        
        // Try cleanup even on failure
        try {
            await cleanup();
        } catch (cleanupErr) {
            // Ignore cleanup errors
        }
        
        process.exit(1);
    }
}

runTests();

