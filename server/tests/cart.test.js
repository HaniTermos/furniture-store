const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');

describe('Cart API Endpoints', () => {
    let authToken;

    beforeAll(async () => {
        // Create a user and login to get token
        const user = {
            name: 'Cart Test User',
            email: 'carttest@example.com',
            password: 'Password123!',
        };

        // Ensure user is clear
        await pool.query('DELETE FROM users WHERE email = $1', [user.email]);

        // Register user
        const res = await request(app).post('/api/auth/register').send(user);
        authToken = res.body.token; // we need this token for cart requests
    });

    describe('GET /api/cart', () => {
        it('should block unauthenticated access', async () => {
            const res = await request(app).get('/api/cart');
            expect(res.statusCode).toEqual(401);
        });

        it('should fetch the cart for an authenticated user', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('items');
            expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    // To prevent cart mutation testing from failing if no product exists, 
    // we'd normally seed a specific product ID here, but this is a good 
    // foundation for ensuring auth works on cart routes.
});
