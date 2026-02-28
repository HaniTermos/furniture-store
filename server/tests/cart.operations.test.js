const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const { createUser, createProduct } = require('./factories');
const { getAuthToken, seedProduct, seedCategory } = require('./utils');

describe('Cart Items Operations', () => {
    let authToken;
    let testProductId;

    beforeAll(async () => {
        // Setup User Token
        const user = createUser({ email: 'cartops2@example.com' });
        await pool.query('DELETE FROM users WHERE email = $1', [user.email]);
        authToken = await getAuthToken(user);

        // Seed Category and Product
        const categoryId = await seedCategory(pool, { name: 'Chairs Ops Test' });
        const productData = createProduct({ category_id: categoryId });
        testProductId = await seedProduct(pool, productData);
    });

    beforeEach(async () => {
        // Clear cart before each test so tests don't leak state into each other
        await request(app)
            .delete('/api/cart')
            .set('Authorization', `Bearer ${authToken}`);
    });

    describe('POST /api/cart', () => {
        it('should add item to cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: testProductId, quantity: 2 });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item.quantity).toBe(2);
        });

        it('should block adding invalid product', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: '00000000-0000-0000-0000-000000000000', quantity: 1 });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/cart/:id', () => {
        it('should update item quantity', async () => {
            // Seed cart with an item
            const addRes = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: testProductId, quantity: 1 });

            const cartItemId = addRes.body.item.id;

            // Perform Update
            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 5 });

            expect(res.statusCode).toBe(200);
            expect(res.body.item.quantity).toBe(5);
        });

        it('should block updating with zero quantity', async () => {
            // Note: API design might actually delete it on 0, but typically block bad formats first
            const res = await request(app)
                .put('/api/cart/some-fake-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 0 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/cart/:id', () => {
        it('should remove item from cart cleanly', async () => {
            // Seed cart
            const addRes = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ product_id: testProductId, quantity: 1 });

            const cartItemId = addRes.body.item.id;

            // Perform Delete
            const res = await request(app)
                .delete(`/api/cart/${cartItemId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.items).toHaveLength(0); // Cart is now empty assuming we only added 1
        });
    });
});
