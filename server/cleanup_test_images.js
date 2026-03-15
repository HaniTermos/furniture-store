const pool = require('./db/pool');

async function cleanup() {
  try {
    const result = await pool.query(
      "DELETE FROM product_images WHERE url = 'https://example.com/test.jpg'"
    );
    console.log('Deleted test image rows:', result.rowCount);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

cleanup();
