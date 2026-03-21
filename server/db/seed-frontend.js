require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcryptjs');
const { generateSlug } = require('../utils/generateSlug');
const logger = require('../utils/logger');

async function seedFrontendData() {
    try {
        logger.info('🌱 Starting FRONTEND database seed...');

        // Clear existing data in FK-safe order (children before parents)
        await pool.query('DELETE FROM order_items');
        await pool.query('DELETE FROM orders');
        await pool.query('DELETE FROM cart_items');
        await pool.query('DELETE FROM saved_design_selections');
        await pool.query('DELETE FROM saved_designs');
        await pool.query('DELETE FROM reviews');

        await pool.query('DELETE FROM configuration_values');
        await pool.query('DELETE FROM configuration_options');
        await pool.query('DELETE FROM product_images');
        await pool.query('DELETE FROM products');
        await pool.query('DELETE FROM categories');

        // Create Admin User if doesn't exist
        const adminPasswordHash = await bcrypt.hash('admin123', 12);
        await pool.query(`
            INSERT INTO users (email, password_hash, name, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
        `, ['admin@furniture-store.com', adminPasswordHash, 'Admin User', 'admin']);

        // Insert Categories
        const categoriesData = [
            { name: 'Living Room', description: 'Sofas, chairs, and tables for your living space' },
            { name: 'Bedroom', description: 'Beds, nightstands, and dressers' },
            { name: 'Dining', description: 'Tables, chairs, and buffets' },
            { name: 'Office', description: 'Desks, office chairs, and shelving' },
        ];

        const categoryIds = {};
        let i = 0;
        for (const cat of categoriesData) {
            const slug = generateSlug(cat.name);
            const { rows } = await pool.query(`
                INSERT INTO categories (name, slug, description, sort_order)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [cat.name, slug, cat.description, i++]);
            categoryIds[cat.name] = rows[0].id;
        }

        // Insert Products
        const productsData = [
            {
                name: 'Luna Liven Lounge Chair',
                sku: 'LUNA-01',
                description: 'The Luna Lounge Chair is designed to invite rest and pause. With soft, curved edges and a solid ash wood frame, it fits seamlessly into small living spaces, reading corners, or bedrooms.',
                short_description: 'Soft curves meet timeless design.',
                base_price: 110,
                category: 'Living Room',
                is_configurable: true,
                images: [
                    { url: '/images/products/chair-orange-1.png', alt: 'Luna Chair - Orange Front', is_primary: true },
                    { url: '/images/products/chair-orange-2.png', alt: 'Luna Chair - Orange Side' },
                    { url: '/images/products/chair-orange-3.png', alt: 'Luna Chair - Orange Back' },
                    { url: '/images/products/chair-black-1.png', alt: 'Luna Chair - Black' },
                    { url: '/images/products/chair-green-1.png', alt: 'Luna Chair - Green' },
                    { url: '/images/products/chair-gray-1.png', alt: 'Luna Chair - Gray' },
                ],
                colors: [
                    { value: 'Sunset Orange|#F97316', url: '/images/products/chair-orange-1.png' },
                    { value: 'Sky Blue|#BFDBFE' },
                    { value: 'Sage Green|#A3B18A', url: '/images/products/chair-green-1.png' },
                    { value: 'Charcoal|#374151', url: '/images/products/chair-black-1.png' },
                    { value: 'Blush|#D4A59A' },
                ],
                sizes: [
                    { value: 'Standard', adj: 0 },
                    { value: 'Large', adj: 30 }
                ]
            },
            {
                name: 'Harmony Dining Table',
                sku: 'HARM-01',
                description: 'A beautifully simple dining table crafted from solid oak with tapered steel legs. Seats up to 6 comfortably.',
                short_description: 'Minimalist dining perfection.',
                base_price: 320,
                category: 'Dining',
                is_configurable: true,
                images: [
                    { url: '/images/products/table-1.png', alt: 'Harmony Table - Front', is_primary: true }
                ],
                colors: [
                    { value: 'Natural Oak|#C49A6C' },
                    { value: 'Dark Walnut|#5C4033' },
                ],
                sizes: [
                    { value: '4 Seat', adj: 0 },
                    { value: '6 Seat', adj: 80 }
                ]
            },
            {
                name: 'Serene Bookshelf',
                sku: 'SER-01',
                description: 'Open-concept bookshelf with asymmetric shelving. Perfect for displaying books, plants, and decorative objects.',
                short_description: 'Display with character.',
                base_price: 189,
                category: 'Living Room',
                is_configurable: true,
                images: [
                    { url: '/images/products/shelf-1.png', alt: 'Serene Bookshelf', is_primary: true }
                ],
                colors: [
                    { value: 'Cloud White|#F5F5F5' },
                    { value: 'Matte Black|#1A1A1A' },
                ],
                sizes: [
                    { value: 'Small (4 shelf)', adj: 0 },
                    { value: 'Tall (6 shelf)', adj: 60 }
                ]
            },
            {
                name: 'Cloud Armchair',
                sku: 'CLO-01',
                description: 'Sink into the Cloud Armchair. Its deep seat, plush cushioning, and clean silhouette will transform any corner into a cozy retreat.',
                short_description: 'Ultimate comfort, minimal form.',
                base_price: 249,
                category: 'Living Room',
                is_configurable: true,
                images: [
                    { url: '/images/products/armchair-1.png', alt: 'Cloud Armchair - White', is_primary: true }
                ],
                colors: [
                    { value: 'Cream|#FFFDD0' },
                    { value: 'Slate Gray|#6B7280' },
                    { value: 'Forest Green|#2D5016' }
                ],
                sizes: [
                    { value: 'Standard', adj: 0 }
                ]
            }
        ];

        for (const prod of productsData) {
            const slug = generateSlug(prod.name);
            const { rows } = await pool.query(`
                INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, is_configurable)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [prod.name, slug, prod.sku, prod.description, prod.short_description, prod.base_price, categoryIds[prod.category], prod.is_configurable]);

            const productId = rows[0].id;

            // Insert Images
            let imgSort = 0;
            for (const img of prod.images) {
                await pool.query(`
                    INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
                    VALUES ($1, $2, $3, $4, $5)
                `, [productId, img.url, img.alt, img.is_primary || false, imgSort++]);
            }

            // Insert Colors
            if (prod.colors) {
                const { rows: [colorOpt] } = await pool.query(
                    `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [productId, 'Color', 'color', 0]
                );
                for (const color of prod.colors) {
                    await pool.query(
                        `INSERT INTO configuration_values (option_id, value, image_url) VALUES ($1, $2, $3)`,
                        [colorOpt.id, color.value, color.url || null]
                    );
                }
            }

            // Insert Sizes
            if (prod.sizes) {
                const { rows: [sizeOpt] } = await pool.query(
                    `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [productId, 'Size', 'size', 1]
                );
                for (const size of prod.sizes) {
                    await pool.query(
                        `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                        [sizeOpt.id, size.value, size.adj]
                    );
                }
            }
        }

        logger.info('🎉 Frontend Database Seeded successfully!');
        process.exit(0);

    } catch (error) {
        logger.error('❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedFrontendData();
