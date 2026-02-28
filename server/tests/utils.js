const request = require('supertest');
const app = require('../app');

const { faker } = require('@faker-js/faker');

module.exports = {
    async getAuthToken(userData) {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);
        return res.body.token;
    },

    async seedCategory(pool, categoryData = {}) {
        const name = categoryData.name || faker.commerce.department() + ' ' + faker.string.uuid();
        const slug = categoryData.slug || (name.toLowerCase().replace(/ /g, '-') + '-' + faker.string.alphanumeric(5));
        const res = await pool.query(`
      INSERT INTO categories (name, slug, is_active)
      VALUES ($1, $2, true) RETURNING id
    `, [name, slug]);
        return res.rows[0].id;
    },

    async seedProduct(pool, productData) {
        const res = await pool.query(`
      INSERT INTO products (name, slug, sku, base_price, category_id, is_active, is_configurable)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `, [
            productData.name,
            productData.slug,
            productData.sku,
            productData.base_price,
            productData.category_id,
            productData.is_active,
            productData.is_configurable
        ]);
        return res.rows[0].id;
    }
};
