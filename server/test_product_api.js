const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 5000, path: path }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n${path} -> ${res.statusCode}`);
        console.log(data.substring(0, 400));
        resolve();
      });
    }).on('error', (err) => {
      console.log(`\n${path} -> ERROR: ${err.message}`);
      resolve();
    });
  });
}

(async () => {
  await testEndpoint('/health');
  await testEndpoint('/api/products/filters');
  await testEndpoint('/api/products/luna-liven-lounge-chair');
  await testEndpoint('/api/products/cloud-armchair');
})();
