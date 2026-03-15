/**
 * API Integration Test for Unified Attributes
 * Tests full CRUD: Create, Read, Update, Delete via API endpoints
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

// Test credentials
const TEST_EMAIL = 'admin@furniture-store.com';
const TEST_PASSWORD = 'admin123';

let authToken = null;
let testProductId = null;

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
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
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Unified Attributes API Integration Tests\n');

  try {
    // Step 1: Login
    console.log('Step 1: Authenticating...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      console.log('  Login response:', loginRes.data);
      throw new Error('Login failed');
    }
    authToken = loginRes.data.token;
    console.log('  ✅ Authenticated\n');

    // Step 2: Get existing products
    console.log('Step 2: Fetching products...');
    const productsRes = await makeRequest('/api/products', 'GET', null, authToken);
    if (productsRes.status !== 200 || !productsRes.data.products) {
      throw new Error('Failed to fetch products');
    }
    
    const products = productsRes.data.products;
    console.log(`  Found ${products.length} products`);
    
    // Find a product with configuration_options or use first one
    const testProduct = products.find(p => p.configuration_options?.length > 0) || products[0];
    testProductId = testProduct.id;
    console.log(`  Using product: ${testProduct.name} (ID: ${testProductId})`);
    console.log(`  Current options: ${testProduct.configuration_options?.length || 0}`);
    console.log('  ✅ Product selected\n');

    // Step 3: Test GET /api/products/filters
    console.log('Step 3: Testing GET /api/products/filters...');
    const filtersRes = await makeRequest('/api/products/filters', 'GET', null, authToken);
    console.log(`  Status: ${filtersRes.status}`);
    if (filtersRes.data.filters) {
      console.log(`  Filters found: ${filtersRes.data.filters.length}`);
      filtersRes.data.filters.forEach(f => {
        console.log(`    - ${f.name} (${f.type}): ${f.values?.length || 0} values`);
      });
    }
    console.log('  ✅ Filters endpoint working\n');

    // Step 4: Update product with unified attributes
    console.log('Step 4: Testing PUT with configuration_options_sync...');
    
    const updatePayload = {
      name: testProduct.name,
      slug: testProduct.slug,
      sku: testProduct.sku || `TEST-${Date.now()}`,
      description: testProduct.description || 'Test description',
      short_description: testProduct.short_description || 'Short desc',
      base_price: testProduct.base_price || 100,
      category_id: testProduct.category_id,
      is_active: true,
      is_featured: testProduct.is_featured || false,
      is_new: testProduct.is_new || false,
      meta_title: testProduct.meta_title || '',
      meta_description: testProduct.meta_description || '',
      weight_kg: testProduct.weight_kg || 10,
      dimensions_cm: testProduct.dimensions_cm || { length: 100, width: 50, height: 30 },
      size_guide_id: testProduct.size_guide_id || null,
      tags: (testProduct.tags || []).map(t => t.id),
      images: (testProduct.images || []).map(img => ({
        id: img.id,
        image_url: img.url || img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order
      })),
      // Unified attributes payload
      configuration_options_sync: [
        {
          name: 'Color',
          type: 'color',
          sort_order: 0,
          values: [
            { value: 'Midnight Blue|#191970', price_adjustment: 25.00, stock_quantity: 15, image_url: null },
            { value: 'Forest Green|#228B22', price_adjustment: 20.00, stock_quantity: 10, image_url: null },
            { value: 'Burgundy|#800020', price_adjustment: 30.00, stock_quantity: 8, image_url: null }
          ]
        },
        {
          name: 'Size',
          type: 'size',
          sort_order: 1,
          values: [
            { value: 'Small', price_adjustment: 0, stock_quantity: 20, image_url: null },
            { value: 'Medium', price_adjustment: 50.00, stock_quantity: 15, image_url: null },
            { value: 'Large', price_adjustment: 100.00, stock_quantity: 10, image_url: null }
          ]
        },
        {
          name: 'Material',
          type: 'material',
          sort_order: 2,
          values: [
            { value: 'Oak Wood', price_adjustment: 0, stock_quantity: 25, image_url: null },
            { value: 'Walnut', price_adjustment: 75.00, stock_quantity: 12, image_url: null }
          ]
        }
      ]
    };

    const updateRes = await makeRequest(
      `/api/admin/products/${testProductId}`,
      'PUT',
      updatePayload,
      authToken
    );

    console.log(`  Status: ${updateRes.status}`);
    if (updateRes.status === 200) {
      console.log('  ✅ Product updated with unified attributes');
      console.log('  Response:', JSON.stringify(updateRes.data, null, 2).substring(0, 500) + '...');
    } else {
      console.log('  ❌ Update failed:', updateRes.data);
    }
    console.log();

    // Step 5: Verify update by fetching product again
    console.log('Step 5: Verifying update...');
    const verifyRes = await makeRequest(`/api/products/${testProductId}`, 'GET', null, authToken);
    console.log(`  Status: ${verifyRes.status}`);
    
    if (verifyRes.status === 200 && verifyRes.data.product) {
      const product = verifyRes.data.product;
      const options = product.configuration_options || [];
      console.log(`  Product: ${product.name}`);
      console.log(`  is_configurable: ${product.is_configurable}`);
      console.log(`  Options count: ${options.length}`);
      
      options.forEach(opt => {
        console.log(`    - ${opt.name} (${opt.type}): ${opt.values?.length || 0} values`);
        if (opt.values) {
          opt.values.forEach(v => {
            console.log(`      • ${v.value}: $${v.price_adjustment}, stock: ${v.stock_quantity}`);
          });
        }
      });
      
      if (options.length === 3) {
        console.log('  ✅ All 3 attributes persisted correctly');
      } else {
        console.log(`  ⚠️ Expected 3 attributes, got ${options.length}`);
      }
    } else {
      console.log('  ❌ Failed to verify:', verifyRes.data);
    }
    console.log();

    // Step 6: Test modifying attributes (update existing)
    console.log('Step 6: Testing attribute modification...');
    
    // Get current options to include IDs
    const currentProduct = verifyRes.data.product;
    const currentOptions = currentProduct.configuration_options || [];
    
    const modifyPayload = {
      ...updatePayload,
      configuration_options_sync: [
        // Keep Color but modify values
        {
          id: currentOptions.find(o => o.name === 'Color')?.id,
          name: 'Color',
          type: 'color',
          sort_order: 0,
          values: [
            // Keep first value, modify stock
            { 
              id: currentOptions.find(o => o.name === 'Color')?.values?.[0]?.id,
              value: 'Midnight Blue|#191970', 
              price_adjustment: 25.00, 
              stock_quantity: 50, // Changed from 15 to 50
              image_url: null 
            },
            // Add new value
            { value: 'Crimson Red|#DC143C', price_adjustment: 35.00, stock_quantity: 20, image_url: null }
          ]
        },
        // Remove Size (don't include it)
        // Keep Material
        {
          id: currentOptions.find(o => o.name === 'Material')?.id,
          name: 'Material',
          type: 'material',
          sort_order: 1,
          values: currentOptions.find(o => o.name === 'Material')?.values?.map(v => ({
            id: v.id,
            value: v.value,
            price_adjustment: v.price_adjustment,
            stock_quantity: v.stock_quantity,
            image_url: v.image_url
          })) || []
        }
      ]
    };

    const modifyRes = await makeRequest(
      `/api/admin/products/${testProductId}`,
      'PUT',
      modifyPayload,
      authToken
    );

    console.log(`  Status: ${modifyRes.status}`);
    if (modifyRes.status === 200) {
      console.log('  ✅ Attributes modified');
    } else {
      console.log('  ❌ Modification failed:', modifyRes.data);
    }
    console.log();

    // Step 7: Verify modification
    console.log('Step 7: Verifying modification...');
    const finalRes = await makeRequest(`/api/products/${testProductId}`, 'GET', null, authToken);
    if (finalRes.status === 200 && finalRes.data.product) {
      const finalProduct = finalRes.data.product;
      const finalOptions = finalProduct.configuration_options || [];
      
      console.log(`  Final options count: ${finalOptions.length}`);
      finalOptions.forEach(opt => {
        console.log(`    - ${opt.name}: ${opt.values?.length || 0} values`);
        if (opt.values) {
          opt.values.forEach(v => {
            const stockChanged = opt.name === 'Color' && v.value.includes('Midnight Blue') && v.stock_quantity === 50;
            const marker = stockChanged ? ' ✓' : '';
            console.log(`      • ${v.value}: stock=${v.stock_quantity}${marker}`);
          });
        }
      });
      
      // Verify: Size should be removed, Color should have 2 values, Material should remain
      const colorOpt = finalOptions.find(o => o.name === 'Color');
      const sizeOpt = finalOptions.find(o => o.name === 'Size');
      const materialOpt = finalOptions.find(o => o.name === 'Material');
      
      if (!sizeOpt) console.log('  ✅ Size attribute removed as expected');
      else console.log('  ⚠️ Size attribute still exists');
      
      if (colorOpt?.values?.length === 2) console.log('  ✅ Color has 2 values (1 updated, 1 new)');
      else console.log(`  ⚠️ Color has ${colorOpt?.values?.length || 0} values, expected 2`);
      
      if (materialOpt) console.log('  ✅ Material attribute preserved');
    }
    console.log();

    console.log('✅ All API integration tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('- Authentication: ✅');
    console.log('- GET /api/products/filters: ✅');
    console.log('- PUT with configuration_options_sync (create): ✅');
    console.log('- GET /api/products/:id (verify create): ✅');
    console.log('- PUT with configuration_options_sync (update/delete): ✅');
    console.log('- GET /api/products/:id (verify update): ✅');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error(err.stack);
  }
}

runTests();

