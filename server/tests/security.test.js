const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');

describe('Security and Edge Case Handlers', () => {

    describe('Handling Malformations', () => {
        it('should handle malformed JSON softly', async () => {
            // Trying to break Express json body parser
            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{"email": "broken_json_"'); // Invalid JSON

            // Should get intercepted by error middleware 400 Bad Request
            expect(res.statusCode).toBe(400);
        });

        it('should handle malformed JWT tokens gracefully', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', 'Bearer invalid.token.xyz123');

            expect(res.statusCode).toBe(401); // Unauthorized
        });
    });

    describe('Injection Boundaries', () => {
        it('should reject SQL syntax inside JSON payload (Parameter Binding Proof)', async () => {
            // This test is mostly a proof of safety (No crash/500)
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "admin' OR 1=1 --",
                    password: "any"
                });

            // It just shouldn't throw a DB parsing 500
            expect([400, 401]).toContain(res.statusCode);
        });
    });

    describe('Rate Limiting Logic', () => {
        it('should trigger rate limits on rapid, repetitive failed auths', async () => {
            const requests = Array(6).fill().map(() =>
                request(app).post('/api/auth/login').send({ email: 'rate@limit.com', password: '1' })
            );

            const results = await Promise.all(requests);
            const statuses = results.map(r => r.statusCode);

            expect(statuses).toContain(429);
        });
    });
});
