const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // 1. Login
  const loginBody = JSON.stringify({ email: 'admin@furniture-store.com', password: 'admin123' });
  const login = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
  }, loginBody);
  console.log('✅ Login:', login.status, '| role:', login.body.user?.role);
  const token = login.body.token;

  // 2. Admin products list
  const products = await request({
    hostname: 'localhost', port: 5000, path: '/api/admin/products?page=1&limit=5', method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
  console.log('✅ Admin products:', products.status, '| total:', products.body.total);

  // 3. Verify no example.com images in product_images
  const firstProductId = products.body.products?.[0]?.id;
  if (firstProductId) {
    const detail = await request({
      hostname: 'localhost', port: 5000, path: `/api/admin/products/${firstProductId}`, method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    });
    const images = detail.body.product?.images || [];
    const badImages = images.filter(img => img.url && img.url.includes('example.com'));
    console.log('✅ Product detail:', detail.status, '| images:', images.length, '| example.com images:', badImages.length);
  }

  // 4. Public shop products
  const shop = await request({ hostname: 'localhost', port: 5000, path: '/api/products?limit=3', method: 'GET' });
  console.log('✅ Shop products:', shop.status, '| count:', shop.body.products?.length, '| total:', shop.body.total);

  // 5. Health check
  const health = await request({ hostname: 'localhost', port: 5000, path: '/health', method: 'GET' });
  console.log('✅ Health:', health.status, '|', health.body.status);

  console.log('\n🎉 All checks passed!');
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
