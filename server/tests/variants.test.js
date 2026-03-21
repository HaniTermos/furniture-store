const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const { createProduct } = require('./factories');

describe('Product Variants & Attributes API', () => {
    let adminToken;
    let testCategory;
    let testProduct;
    let testAttribute;
    let testOption;

    beforeAll(async () => {
        // Ensure migrations are applied
        const { rows: tableExists } = await pool.query(`
            SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_variants')
        `);
        
        if (!tableExists[0].exists) {
            const fs = require('fs');
            const path = require('path');
            const migrationsDir = path.join(__dirname, '../db/migrations');
            const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
            for (const file of files) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await pool.query(sql);
            }
        }

        // Setup admin user & get token
        const { createUser } = require('./factories');
        const adminData = createUser(); // Default factory data
        const regRes = await request(app).post('/api/auth/register').send(adminData);
        const adminId = regRes.body.user.id;
        
        // ELEVATE TO ADMIN MANUALLY (Since registration defaults to 'user')
        await pool.query("UPDATE users SET role = 'admin', email_verified = true WHERE id = $1", [adminId]);
        
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: adminData.email, password: adminData.password });
        
        adminToken = loginRes.body.token;
        if (!adminToken) {
            throw new Error('Failed to obtain admin token: ' + JSON.stringify(loginRes.body));
        }

        // Setup base categories/attributes
        const catRes = await pool.query(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
            ['Test Category', 'test-category']
        );
        testCategory = catRes.rows[0];

        const attrRes = await pool.query(
            "INSERT INTO attributes (name, slug, type) VALUES ($1, $2, $3) RETURNING id",
            ['Test Color', 'test-color', 'color']
        );
        testAttribute = attrRes.rows[0].id;

        const optRes = await pool.query(
            "INSERT INTO attribute_options (attribute_id, value, slug, color_hex) VALUES ($1, $2, $3, $4) RETURNING id",
            [testAttribute, 'Red', 'red', '#FF0000']
        );
        testOption = optRes.rows[0].id;
    });

    describe('Variant Life Cycle', () => {
        it('should create a product with variants and attributes', async () => {
            const { createProduct: createProdFactory } = require('./factories');
            const productData = createProdFactory({ 
                category_id: testCategory.id,
                has_variants: true,
                attributes: [testAttribute] 
            });
            
                // 1. Create Product (Using admin endpoint for attribute support)
            const createRes = await request(app)
                .post('/api/admin/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData);

            expect(createRes.statusCode).toEqual(201);
            testProduct = createRes.body.product;
            expect(testProduct.has_variants).toBe(true);

            // 2. Create Variant Matrix
            const matrixRes = await request(app)
                .post(`/api/products/${testProduct.id}/variants/matrix`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    matrix: [{
                        sku: `TEST-SKU-${Date.now()}`,
                        price: 99.99,
                        stock_quantity: 10,
                        is_active: true,
                        attributes: [{ attribute_id: testAttribute, option_id: testOption }]
                    }]
                });

            expect(matrixRes.statusCode).toEqual(201);
            expect(matrixRes.body.data.length).toBe(1);

            // 3. Update Product (Using admin endpoint)
            const updateRes = await request(app)
                .put(`/api/admin/products/${testProduct.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    ...productData,
                    description: 'Updated Description - Long enough for validation if any',
                    attributes: [testAttribute]
                });

            expect(updateRes.statusCode).toEqual(200);
            expect(updateRes.body.product.attributes.length).toBeGreaterThan(0);
            expect(updateRes.body.product.attributes[0].options.length).toBeGreaterThan(0);

            // 4. Verify Storefront (getOne)
            const getRes = await request(app).get(`/api/products/${testProduct.slug}`);
            expect(getRes.statusCode).toEqual(200);
            expect(getRes.body.product.has_variants).toBe(true);
            expect(getRes.body.product.variants.length).toBe(1);
            expect(getRes.body.product.attributes.length).toBe(1);
            expect(getRes.body.product.attributes[0].options.length).toBe(1);

            // 5. Verify Storefront (getAll)
            const listRes = await request(app).get('/api/products');
            const found = listRes.body.products.find(p => p.id === testProduct.id);
            expect(found).toBeDefined();
            expect(found.attributes.length).toBeGreaterThan(0);
            expect(found.attributes[0].options.length).toBeGreaterThan(0);
        });

        it('should show options even if variant is out of stock', async () => {
             const { createProduct: createProdFactory } = require('./factories');
             const oosProductData = createProdFactory({ 
                category_id: testCategory.id,
                has_variants: true,
                attributes: [testAttribute] 
            });
            
            const pRes = await request(app)
                .post('/api/admin/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(oosProductData);
                
            expect(pRes.statusCode).toEqual(201);
            const p = pRes.body.product;

            await request(app)
                .post(`/api/products/${p.id}/variants/matrix`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    matrix: [{
                        sku: `OOS-SKU-${Date.now()}`,
                        price: 50.00,
                        stock_quantity: 0,
                        is_active: true,
                        attributes: [{ attribute_id: testAttribute, option_id: testOption }]
                    }]
                });
            
            // Should show the option in getOne attributes
            const getRes = await request(app).get(`/api/products/${p.slug}`);
            expect(getRes.body.product.attributes[0].options.length).toBeGreaterThan(0);
            
            // Should also show in getAll (due to Attribute.js fallback)
            const listRes = await request(app).get('/api/products');
            const found = listRes.body.products.find(item => item.id === p.id);
            expect(found.attributes[0].options.length).toBeGreaterThan(0);
        });
    });
});
