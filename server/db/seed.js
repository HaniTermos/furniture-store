const { faker } = require('@faker-js/faker');
const pool = require('./pool');
const bcrypt = require('bcryptjs');
const { generateSlug } = require('../utils/generateSlug');
const logger = require('../utils/logger');

async function seedDatabase() {
    try {
        logger.info('🚀 Starting REALISTIC database seed...');

        // ─── 0. CLEANUP ─────────────────────────────────────────────
        logger.info('🧹 Cleaning up old data...');
        await pool.query('TRUNCATE users, categories, products, product_images, attributes, attribute_options, product_variants, variant_attributes, product_attributes, orders, order_items, reviews RESTART IDENTITY CASCADE');

        // ─── 1. USERS ───────────────────────────────────────────────
        const adminPassword = await bcrypt.hash('admin123', 12);
        const userPassword = await bcrypt.hash('user123', 12);

        const { rows: [admin] } = await pool.query(`
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, ['admin@furniture-store.com', adminPassword, 'Hani Admin', '+961 70 000000', 'admin']);

        const customerIds = [];
        for (let i = 1; i <= 20; i++) {
            const { rows: [user] } = await pool.query(`
                INSERT INTO users (email, password_hash, name, phone, role)
                VALUES ($1, $2, $3, $4, $5) RETURNING id
            `, [faker.internet.email(), userPassword, faker.person.fullName(), faker.phone.number(), 'user']);
            customerIds.push(user.id);
        }
        logger.info('✅ Users created (Admin + 20 Customers)');

        // ─── 2. CATEGORIES ──────────────────────────────────────────
        const categories = [
            { name: 'Living Room', desc: 'Sofas, coffee tables, and media units for your common area.' },
            { name: 'Bedroom', desc: 'Beds, nightstands, and wardrobes for a peaceful sleep.' },
            { name: 'Dining', desc: 'Tables and chairs designed for gathering.' },
            { name: 'Office', desc: 'Ergonomic chairs and desks for maximum productivity.' },
            { name: 'Outdoor', desc: 'Weather-resistant furniture for your garden or patio.' },
            { name: 'Storage', desc: 'Shelving, cabinets, and chests to keep things organized.' }
        ];

        const catMap = {};
        for (const cat of categories) {
            const { rows: [inserted] } = await pool.query(`
                INSERT INTO categories (name, slug, description)
                VALUES ($1, $2, $3) RETURNING id
            `, [cat.name, generateSlug(cat.name), cat.desc]);
            catMap[cat.name] = inserted.id;
        }
        logger.info('✅ Categories created');

        // ─── 3. GLOBAL ATTRIBUTES ────────────────────────────────────
        const attrs = [
            { name: 'Color', slug: 'color', type: 'color' },
            { name: 'Material', slug: 'material', type: 'select' },
            { name: 'Size', slug: 'size', type: 'select' }
        ];

        const attrMap = {};
        for (const attr of attrs) {
            const { rows: [inserted] } = await pool.query(`
                INSERT INTO attributes (name, slug, type, is_used_for_variations)
                VALUES ($1, $2, $3, true) RETURNING id
            `, [attr.name, attr.slug, attr.type]);
            attrMap[attr.slug] = inserted.id;
        }

        // Options
        const optionsData = {
            color: [
                { val: 'Midnight Blue', hex: '#191970' },
                { val: 'Emerald Green', hex: '#50C878' },
                { val: 'Slate Gray', hex: '#708090' },
                { val: 'Ivory White', hex: '#FFFFF0' },
                { val: 'Walnut Brown', hex: '#5D4037' }
            ],
            material: [
                { val: 'Solid Oak' },
                { val: 'Premium Velvet' },
                { val: 'Brushed Steel' },
                { val: 'Italian Leather' }
            ],
            size: [
                { val: 'Standard' },
                { val: 'Compact' },
                { val: 'Grand' }
            ]
        };

        const optMap = {};
        for (const [slug, opts] of Object.entries(optionsData)) {
            optMap[slug] = [];
            for (const opt of opts) {
                const { rows: [inserted] } = await pool.query(`
                    INSERT INTO attribute_options (attribute_id, value, slug, color_hex)
                    VALUES ($1, $2, $3, $4) RETURNING id, value
                `, [attrMap[slug], opt.val, generateSlug(opt.val), opt.hex || null]);
                optMap[slug].push(inserted);
            }
        }
        logger.info('✅ Attributes and Options created');

        // ─── 4. PRODUCTS & VARIANTS ──────────────────────────────────
        const furnitureAdjectives = ['Nordic', 'Industrial', 'Minimalist', 'Luxe', 'Rustic', 'Modernist', 'Scandi', 'Artisan'];
        const furnitureTypes = ['Sofa', 'Armchair', 'Desk', 'Table', 'Bed', 'Shelf', 'Cabinet', 'Stool'];
        
        const products = [];
        for (let i = 0; i < 50; i++) {
            const adj = faker.helpers.arrayElement(furnitureAdjectives);
            const type = faker.helpers.arrayElement(furnitureTypes);
            const name = `${adj} ${faker.commerce.productName().split(' ')[0]} ${type}`;
            const basePrice = parseFloat(faker.commerce.price({ min: 150, max: 2500 }));
            const categoryName = faker.helpers.arrayElement(Object.keys(catMap));
            
            const { rows: [prod] } = await pool.query(`
                INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, is_configurable, is_featured, is_new)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, base_price, sku, name
            `, [
                name,
                generateSlug(name + '-' + faker.string.alphanumeric(4)),
                `FURN-${faker.string.alphanumeric(8).toUpperCase()}`,
                faker.commerce.productDescription(),
                faker.lorem.sentence(),
                basePrice,
                catMap[categoryName],
                true,
                faker.datatype.boolean(0.2),
                faker.datatype.boolean(0.1)
            ]);

            // Assign attributes to product
            const assignedAttrs = faker.helpers.arrayElements(['color', 'material', 'size'], { min: 2, max: 3 });
            for (const aSlug of assignedAttrs) {
                await pool.query(`
                    INSERT INTO product_attributes (product_id, attribute_id)
                    VALUES ($1, $2)
                `, [prod.id, attrMap[aSlug]]);
            }

            // Create 3-5 variants per product
            for (let v = 0; v < 4; v++) {
                const variantSku = `${prod.sku}-V${v}`;
                const variantPrice = parseFloat(prod.base_price) + (v * 50);
                
                const { rows: [variant] } = await pool.query(`
                    INSERT INTO product_variants (product_id, sku, price, stock_quantity, is_default)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id
                `, [prod.id, variantSku, variantPrice, faker.number.int({ min: 0, max: 100 }), v === 0]);

                // Link variant to options
                for (const aSlug of assignedAttrs) {
                    const randomOpt = faker.helpers.arrayElement(optMap[aSlug]);
                    await pool.query(`
                        INSERT INTO variant_attributes (variant_id, attribute_id, option_id)
                        VALUES ($1, $2, $3)
                    `, [variant.id, attrMap[aSlug], randomOpt.id]);
                }
            }
            products.push(prod);
        }
        logger.info('✅ 50 Products created with dense variant linking');

        // ─── 5. ORDERS (Historical Data for Charts) ─────────────────
        logger.info('📊 Generating 100+ historical orders...');
        for (let i = 0; i < 120; i++) {
            const customerId = faker.helpers.arrayElement(customerIds);
            const orderDate = faker.date.past({ years: 1 });
            const status = faker.helpers.arrayElement(['delivered', 'delivered', 'shipped', 'processing', 'pending']);
            
            // Random items
            const orderItems = faker.helpers.arrayElements(products, { min: 1, max: 3 });
            let subtotal = 0;
            const itemsToInsert = [];

            for (const p of orderItems) {
                const qty = faker.number.int({ min: 1, max: 2 });
                const price = parseFloat(p.base_price);
                subtotal += price * qty;
                itemsToInsert.push({ id: p.id, qty, price, name: p.name, sku: p.sku });
            }

            const { rows: [order] } = await pool.query(`
                INSERT INTO orders (order_number, user_id, status, payment_status, subtotal, total_amount, shipping_address, billing_address, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
            `, [
                `ORD-${faker.string.alphanumeric(6).toUpperCase()}`,
                customerId,
                status,
                status === 'delivered' ? 'completed' : 'pending',
                subtotal,
                subtotal + 25, // Shipping
                JSON.stringify({ street: faker.location.streetAddress(), city: faker.location.city(), country: 'Lebanon' }),
                JSON.stringify({ street: faker.location.streetAddress(), city: faker.location.city(), country: 'Lebanon' }),
                orderDate
            ]);

            for (const item of itemsToInsert) {
                await pool.query(`
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_sku)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [order.id, item.id, item.qty, item.price, item.price * item.qty, item.name, item.sku]);
            }
        }
        logger.info('✅ Historical orders generated');

        // ─── 6. REVIEWS ──────────────────────────────────────────────
        for (let i = 0; i < 60; i++) {
            const prod = faker.helpers.arrayElement(products);
            const user = faker.helpers.arrayElement(customerIds);
            await pool.query(`
                INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase, is_approved)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                user,
                prod.id,
                faker.number.int({ min: 3, max: 5 }),
                faker.lorem.words(3),
                faker.lorem.paragraph(),
                true,
                true
            ]);
        }
        logger.info('✅ Customer reviews generated');

        logger.info('🎉 SEEDING COMPLETE. Enjoy your realistic demo data!');
        process.exit(0);
    } catch (err) {
        logger.error('❌ Seed failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

seedDatabase();
