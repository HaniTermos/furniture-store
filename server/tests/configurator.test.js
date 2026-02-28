const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const { createUser, createProduct } = require('./factories');
const { getAuthToken, seedProduct, seedCategory } = require('./utils');

describe('Product Configurator API', () => {

    let testConfigurableProductId;
    let testOptionId;
    let testValueId;

    beforeAll(async () => {
        // Build environment
        const categoryId = await seedCategory(pool, { name: 'ConfigTest Category' });

        // 1. Create a Configurable Product
        const productData = createProduct({
            category_id: categoryId,
            base_price: 1000.00,
            is_configurable: true
        });
        testConfigurableProductId = await seedProduct(pool, productData);

        // 2. Create Options
        const optionRes = await pool.query(
            `INSERT INTO configuration_options (product_id, name, type)
             VALUES ($1, $2, $3) RETURNING id`,
            [testConfigurableProductId, 'Fabric Type', 'material']
        );
        testOptionId = optionRes.rows[0].id;

        // 3. Create Option Values
        const valRes = await pool.query(
            `INSERT INTO configuration_values (option_id, value, price_adjustment)
             VALUES ($1, $2, $3) RETURNING id`,
            [testOptionId, 'Premium Silk', 250.00]
        );
        testValueId = valRes.rows[0].id;
    });

    describe('POST /api/configurator/calculate', () => {
        it('should calculate base price with valid adjustments', async () => {
            const res = await request(app)
                .post('/api/configurator/calculate-price')
                .send({
                    product_id: testConfigurableProductId,
                    configuration: {
                        [testOptionId]: testValueId
                    }
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('totalPrice', 1250);
            expect(res.body).toHaveProperty('breakdown');
            expect(res.body.breakdown).toContainEqual({ label: 'Base Price', amount: 1000 });
            expect(res.body.breakdown).toContainEqual({ label: 'Premium Silk', amount: 250 });
        });

        it('should calculate correctly with empty configuration', async () => {
            const res = await request(app)
                .post('/api/configurator/calculate-price')
                .send({
                    product_id: testConfigurableProductId,
                    configuration: {}
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('totalPrice', 1000);
        });

        it('should return 400 when missing product_id', async () => {
            const res = await request(app)
                .post('/api/configurator/calculate-price')
                .send({ configuration: {} });

            expect(res.statusCode).toBe(400);
        });
    });
});
