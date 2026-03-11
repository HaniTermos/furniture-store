const http = require('http');
const fs = require('fs');
const FormData = require('form-data'); // we might not have it, let's just use axios if available
// Actually, let's just write a purely native node fetch or require('http') req since Node 18+ has fetch
async function runTests() {
  console.log('Testing Backend Fixes...');
  try {
    // 1. Test getFeatured
    console.log('Fetching featured products...');
    const featuredRes = await fetch('http://localhost:5000/api/products/featured');
    const featuredData = await featuredRes.json();
    console.log('Featured products:', featuredData.data?.length || 0, 'items');
    if (featuredData.data && featuredData.data.length > 0) {
      console.log('First featured product is_featured:', featuredData.data[0].is_featured);
    }
  } catch (err) {
    console.error('Error fetching featured products:', err.message);
  }
}

runTests();
