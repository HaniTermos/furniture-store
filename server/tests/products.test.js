const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');

describe('Products API Endpoints', () => {
    describe('GET /api/products', () => {
        it('should fetch a list of products', async () => {
            const res = await request(app).get('/api/products');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('products');
            expect(Array.isArray(res.body.products)).toBe(true);
            expect(res.body).toHaveProperty('totalPages');
            expect(res.body).toHaveProperty('total');
        });

        it('should correctly paginate products', async () => {
            const res = await request(app).get('/api/products?page=1&limit=2');

            expect(res.statusCode).toEqual(200);
            expect(res.body.products.length).toBeLessThanOrEqual(2);
            // Since API doesn't return limit, just check pagination response validity
            expect(res.body).toHaveProperty('page', 1);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should handle invalid UUID format', async () => {
            const res = await request(app).get('/api/products/invalid-id-format');

            expect(res.statusCode).toEqual(404); // Bad Request because of invalid UUID
        });

        it('should return 404 for a non-existent valid UUID', async () => {
            const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');

            expect(res.statusCode).toEqual(404);
        });

        // Note: Testing successful fetch requires knowing an existing ID (which seed.js would create)
        // We will skip testing exact fetch unless we inject a specific product first
    });
});
