require('dotenv').config();
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const r = http.request(
      { hostname: '127.0.0.1', port: 5000, path, method, headers },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, data: raw });
          }
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  try {
    const login = await req('POST', '/api/auth/login', {
      email: 'admin@furniture-store.com',
      password: 'admin123',
    });

    if (login.status !== 200 || !login.data?.token) {
      console.log('login failed', login.status, login.data);
      process.exit(1);
    }

    const token = login.data.token;

    const categories = await req('GET', '/api/admin/categories', null, token);
    const attributes = await req('GET', '/api/admin/attributes', null, token);

    const categoriesCount = Array.isArray(categories.data)
      ? categories.data.length
      : Array.isArray(categories.data?.categories)
      ? categories.data.categories.length
      : 'n/a';

    const attributesCount = Array.isArray(attributes.data)
      ? attributes.data.length
      : Array.isArray(attributes.data?.attributes)
      ? attributes.data.attributes.length
      : 'n/a';

    console.log('categories:', categories.status, 'count:', categoriesCount);
    console.log('attributes:', attributes.status, 'count:', attributesCount);

    if (categories.status !== 200) console.log('categories body:', categories.data);
    if (attributes.status !== 200) console.log('attributes body:', attributes.data);

    process.exit(0);
  } catch (e) {
    console.error('diagnostics failed:', e.message);
    process.exit(1);
  }
})();
