const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

describe('Auth API Endpoints', () => {
    const testUser = {
        name: 'Test Auth User',
        email: 'testauth@example.com',
        password: 'Password123!',
    };

    beforeAll(async () => {
        // Ensure user does not exist
        await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', testUser.email);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail if email is already registered', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('error');
        });

        it('should fail validation with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Short Pass',
                    email: 'shortpass@example.com',
                    password: '123'
                });

            expect(res.statusCode).toEqual(400); // Or whatever validation error code
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should prevent login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});
