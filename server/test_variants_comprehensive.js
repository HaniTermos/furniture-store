#!/usr/bin/env node
/**
 * Comprehensive Variants System Test
 * Tests ALL endpoints and edge cases
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

const TEST_EMAIL = 'admin@furniture-store.com';
const TEST_PASSWORD = 'admin123';

let authToken = null;
let testAttributeId = null;
let testOptionId = null;
let testProductId = null;
let testVariantId = null;
let testVariantId2 = null;

function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
                catch { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function login() {
    console.log('🔐 Logging in...');
    const res = await makeRequest('/api/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });
    if (res.status !== 200) throw new Error(`Login failed: ${res.data.error}`);
    authToken = res.data.token;
    console.log('✅ Logged in\n');
}

// ============ ATTRIBUTES TESTS ============
async function testCreateAttribute() {
    console.log('🏷️  TEST: Create Attribute');
    const res = await makeRequest('/api/attributes', 'POST', {
        name: 'Test Size',
        slug: 'test-size',
        type: 'select',
        sort_order: 1
    }, authToken);
    if (res.status !== 201) throw new Error(`Create attribute failed: ${JSON.stringify(res.data)}`);
    testAttributeId = res.data.data.id;
    console.log(`   ✅ Created: ${res.data.data.name} (ID: ${testAttributeId})`);
}

async function testUpdateAttribute() {
    console.log('🏷️  TEST: Update Attribute');
    const res = await makeRequest(`/api/attributes/${testAttributeId}`, 'PUT', {
        name: 'Test Size Updated',
        sort_order: 2
    }, authToken);
    if (res.status !== 200) throw new Error(`Update attribute failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Updated: ${res.data.data.name}`);
}

async function testCreateAttributeOption() {
    console.log('🎨 TEST: Create Attribute Option');
    const res = await makeRequest(`/api/attributes/${testAttributeId}/options`, 'POST', {
        value: 'Large',
        slug: 'large',
        sort_order: 1
    }, authToken);
    if (res.status !== 201) throw new Error(`Create option failed: ${JSON.stringify(res.data)}`);
    testOptionId = res.data.data.id;
    console.log(`   ✅ Created option: ${res.data.data.value} (ID: ${testOptionId})`);
}

async function testUpdateAttributeOption() {
    console.log('🎨 TEST: Update Attribute Option');
    const res = await makeRequest(`/api/attributes/options/${testOptionId}`, 'PUT', {
        value: 'Extra Large',
        sort_order: 2
    }, authToken);
    if (res.status !== 200) throw new Error(`Update option failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Updated option: ${res.data.data.value}`);
}

async function testGetAttributeById() {
    console.log('🏷️  TEST: Get Attribute by ID');
    const res = await makeRequest(`/api/attributes/${testAttributeId}`);
    if (res.status !== 200) throw new Error(`Get attribute failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Found: ${res.data.data.name}`);
}

async function testGetAllAttributes() {
    console.log('🏷️  TEST: Get All Attributes');
    const res = await makeRequest('/api/attributes');
    if (res.status !== 200) throw new Error(`Get attributes failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Found ${res.data.data.length} attributes`);
}

// ============ VARIANTS TESTS ============
async function testCreateVariant() {
    console.log('📦 TEST: Create Product Variant');
    // Get a product first
    const productsRes = await makeRequest('/api/products?limit=1');
    if (productsRes.status !== 200 || !productsRes.data.products?.length) {
        console.log('   ⚠️  No products found, skipping variant tests');
        return false;
    }
    testProductId = productsRes.data.products[0].id;
    
    const res = await makeRequest(`/api/products/${testProductId}/variants`, 'POST', {
        sku: 'TEST-SKU-001',
        price: 299.99,
        stock_quantity: 100,
        stock_status: 'in_stock',
        is_active: true,
        attributes: [{ attribute_id: testAttributeId, value: 'Extra Large' }]
    }, authToken);
    if (res.status !== 201) throw new Error(`Create variant failed: ${JSON.stringify(res.data)}`);
    testVariantId = res.data.data.id;
    console.log(`   ✅ Created variant: ${res.data.data.sku} (ID: ${testVariantId})`);
    return true;
}

async function testCreateVariantDuplicateSKU() {
    console.log('📦 TEST: Create Variant with Duplicate SKU (should fail)');
    const res = await makeRequest(`/api/products/${testProductId}/variants`, 'POST', {
        sku: 'TEST-SKU-001', // Same SKU
        price: 199.99,
        stock_quantity: 50
    }, authToken);
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Correctly rejected duplicate SKU`);
}

async function testCreateSecondVariant() {
    console.log('📦 TEST: Create Second Variant');
    const res = await makeRequest(`/api/products/${testProductId}/variants`, 'POST', {
        sku: 'TEST-SKU-002',
        price: 349.99,
        stock_quantity: 75,
        stock_status: 'in_stock',
        is_active: true
    }, authToken);
    if (res.status !== 201) throw new Error(`Create variant failed: ${JSON.stringify(res.data)}`);
    testVariantId2 = res.data.data.id;
    console.log(`   ✅ Created variant: ${res.data.data.sku} (ID: ${testVariantId2})`);
}

async function testGetVariants() {
    console.log('📦 TEST: Get Product Variants');
    const res = await makeRequest(`/api/products/${testProductId}/variants`);
    if (res.status !== 200) throw new Error(`Get variants failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Found ${res.data.data.length} variants`);
}

async function testGetVariantById() {
    console.log('📦 TEST: Get Variant by ID');
    const res = await makeRequest(`/api/products/${testProductId}/variants/${testVariantId}`);
    if (res.status !== 200) throw new Error(`Get variant failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Found variant: ${res.data.data.sku}`);
}

async function testUpdateVariant() {
    console.log('📦 TEST: Update Variant');
    const res = await makeRequest(`/api/products/${testProductId}/variants/${testVariantId}`, 'PUT', {
        price: 399.99,
        stock_quantity: 150
    }, authToken);
    if (res.status !== 200) throw new Error(`Update variant failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Updated: price=${res.data.data.price}, stock=${res.data.data.stock_quantity}`);
}

async function testCreateVariantMatrix() {
    console.log('📦 TEST: Create Variant Matrix');
    const res = await makeRequest(`/api/products/${testProductId}/variants/matrix`, 'POST', {
        matrix: [
            { sku: 'MATRIX-001', price: 199.99, stock_quantity: 10 },
            { sku: 'MATRIX-002', price: 249.99, stock_quantity: 20 },
            { sku: 'MATRIX-003', price: 299.99, stock_quantity: 30 }
        ]
    }, authToken);
    if (res.status !== 201) throw new Error(`Create matrix failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Created ${res.data.data.length} variants via matrix`);
}

async function testDeleteVariant() {
    console.log('📦 TEST: Delete Single Variant');
    const res = await makeRequest(`/api/products/${testProductId}/variants/${testVariantId2}`, 'DELETE', null, authToken);
    if (res.status !== 200) throw new Error(`Delete variant failed: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Deleted variant`);
}

// ============ EDGE CASES ============
async function testUnauthorizedAccess() {
    console.log('🔒 TEST: Unauthorized Access (should fail)');
    const res = await makeRequest('/api/attributes', 'POST', {
        name: 'Unauthorized',
        slug: 'unauthorized'
    }); // No token
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    console.log(`   ✅ Correctly rejected unauthorized request`);
}

async function testInvalidData() {
    console.log('⚠️  TEST: Invalid Data (should fail)');
    const res = await makeRequest('/api/attributes', 'POST', {
        name: '', // Empty name
        slug: ''  // Empty slug
    }, authToken);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}: ${JSON.stringify(res.data)}`);
    console.log(`   ✅ Correctly rejected invalid data`);
}

async function testNotFound() {
    console.log('❓ TEST: Get Non-existent Resource (should fail)');
    const res = await makeRequest('/api/attributes/00000000-0000-0000-0000-000000000000');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    console.log(`   ✅ Correctly returned 404`);
}

// ============ CLEANUP ============
async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete all matrix variants
    if (testProductId) {
        await makeRequest(`/api/products/${testProductId}/variants`, 'DELETE', null, authToken);
        console.log('   - Deleted all variants for product');
    }
    
    // Delete option
    if (testOptionId) {
        await makeRequest(`/api/attributes/options/${testOptionId}`, 'DELETE', null, authToken);
        console.log('   - Deleted test option');
    }
    
    // Delete attribute
    if (testAttributeId) {
        await makeRequest(`/api/attributes/${testAttributeId}`, 'DELETE', null, authToken);
        console.log('   - Deleted test attribute');
    }
    
    console.log('✅ Cleanup complete\n');
}

// ============ MAIN ============
async function runTests() {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('  🧪 COMPREHENSIVE VARIANTS SYSTEM TEST\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const results = { passed: 0, failed: 0, tests: [] };
    
    async function runTest(name, testFn) {
        try {
            await testFn();
            results.passed++;
            results.tests.push({ name, status: '✅ PASS' });
        } catch (err) {
            results.failed++;
            results.tests.push({ name, status: '❌ FAIL', error: err.message });
            console.log(`   ❌ FAILED: ${err.message}`);
        }
    }
    
    try {
        await login();
        
        // Attribute tests
        await runTest('Create Attribute', testCreateAttribute);
        await runTest('Update Attribute', testUpdateAttribute);
        await runTest('Create Attribute Option', testCreateAttributeOption);
        await runTest('Update Attribute Option', testUpdateAttributeOption);
        await runTest('Get Attribute by ID', testGetAttributeById);
        await runTest('Get All Attributes', testGetAllAttributes);
        
        // Variant tests
        const hasProduct = await testCreateVariant();
        if (hasProduct) {
            await runTest('Create Variant - Duplicate SKU', testCreateVariantDuplicateSKU);
            await runTest('Create Second Variant', testCreateSecondVariant);
            await runTest('Get Product Variants', testGetVariants);
            await runTest('Get Variant by ID', testGetVariantById);
            await runTest('Update Variant', testUpdateVariant);
            await runTest('Create Variant Matrix', testCreateVariantMatrix);
            await runTest('Delete Single Variant', testDeleteVariant);
        }
        
        // Edge cases
        await runTest('Unauthorized Access', testUnauthorizedAccess);
        await runTest('Invalid Data', testInvalidData);
        await runTest('Not Found', testNotFound);
        
        // Summary
        console.log('\n═══════════════════════════════════════════════════════════\n');
        console.log('  📊 TEST SUMMARY\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        results.tests.forEach(t => {
            console.log(`  ${t.status} ${t.name}`);
            if (t.error) console.log(`      Error: ${t.error}`);
        });
        console.log(`\n  ✅ Passed: ${results.passed}`);
        console.log(`  ❌ Failed: ${results.failed}`);
        console.log(`  📈 Total: ${results.passed + results.failed}`);
        
        if (results.failed === 0) {
            console.log('\n  🎉 ALL TESTS PASSED!\n');
        } else {
            console.log('\n  ⚠️  SOME TESTS FAILED\n');
        }
        
        await cleanup();
        process.exit(results.failed > 0 ? 1 : 0);
        
    } catch (err) {
        console.error('\n❌ FATAL ERROR:', err.message);
        await cleanup();
        process.exit(1);
    }
}

runTests();

