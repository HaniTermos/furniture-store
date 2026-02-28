const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');

describe('Database Connection', () => {
    it('should connect to the test database successfully', async () => {
        const res = await pool.query('SELECT NOW()');
        expect(res.rows.length).toBeGreaterThan(0);
    });

    it('should have the correct test database name in connection', async () => {
        const res = await pool.query('SELECT current_database()');
        expect(res.rows[0].current_database).toBe('furniture_store_test');
    });

    it('should have health endpoint working', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('environment', 'test');
    });
});
