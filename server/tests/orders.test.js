const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const { createUser, createProduct } = require('./factories');
const { getAuthToken, seedProduct, seedCategory } = require('./utils');

describe('Order Lifecycle API', () => {
    let authToken;
    let testProductId;
    let userId;

    beforeAll(async () => {
        // Build environment
        const user = createUser({ email: 'orderops@example.com' });
        await pool.query('DELETE FROM users WHERE email = $1', [user.email]);
        authToken = await getAuthToken(user);

        // Grab user ID from auth API response or we can fetch manually
        const profileRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${authToken}`);
        userId = profileRes.body.user.id;

        // Seed product
        const categoryId = await seedCategory(pool, { name: 'Order Test Category' });
        const productData = createProduct({ category_id: categoryId, base_price: 150.00 });
        testProductId = await seedProduct(pool, productData);
    });

    beforeEach(async () => {
        // Clear cart to run isolated scenarios
        await request(app)
            .delete('/api/cart')
            .set('Authorization', `Bearer ${authToken}`);
    });

    it('should prevent checkout with an empty cart', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                shipping_address: { street: '123 Empty', city: 'Void' },
                billing_address: { street: '123 Empty', city: 'Void' },
                payment_method: 'credit_card'
            });

        expect(res.statusCode).toBe(400); // Bad Request (Cart is empty)
    });

    it('should successfully create an order from a populated cart', async () => {
        // 1. Populate Cart
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ product_id: testProductId, quantity: 2 }); // Total $300.00 base

        // 2. Checkout & Create Order
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                shipping_address: { street: '123 Valid St', city: 'Tech Town' },
                billing_address: { street: '123 Valid St', city: 'Tech Town' },
                payment_method: 'credit_card'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order.status).toBe('pending');
        expect(Number(res.body.order.total_amount)).toBeGreaterThan(0);

        // 3. Ensure the Cart is Cleared automatically after checkout
        const cartRes = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${authToken}`);
        expect(cartRes.body.items).toHaveLength(0);
    });

    it('should fetch the user order history', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.orders)).toBe(true);
        expect(res.body.orders.length).toBeGreaterThan(0); // We just placed an order
    });
});
