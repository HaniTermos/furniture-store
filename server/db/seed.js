require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcryptjs');
const { generateSlug } = require('../utils/generateSlug');
const logger = require('../utils/logger');

async function seedDatabase() {
    try {
        logger.info('🌱 Starting database seed...');

        // ─── Create Admin User ──────────────────────────────────────
        const adminPasswordHash = await bcrypt.hash('admin123', 12);
        const { rows: [adminUser] } = await pool.query(`
      INSERT INTO users (email, password_hash, name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `, ['admin@furniture-store.com', adminPasswordHash, 'Admin User', '+961 70 000000', 'admin']);

        if (adminUser) {
            logger.info('✅ Admin user created: admin@furniture-store.com / admin123');
        } else {
            logger.info('ℹ️  Admin user already exists.');
        }

        // ─── Create Sample Customer ──────────────────────────────────
        const userPasswordHash = await bcrypt.hash('user123', 12);  // ✅ FIXED: variable name matches
        await pool.query(`
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `, ['user@test.com', userPasswordHash, 'Test User', '+961 71 111111', 'user']);  // ✅ Now matches

        // ─── Create Categories ───────────────────────────────────────
        const categories = [
            { name: 'Living Room', description: 'Sofas, coffee tables, and living room furniture' },
            { name: 'Bedroom', description: 'Beds, wardrobes, and bedroom essentials' },
            { name: 'Closets', description: 'Custom closets and storage solutions' },
            { name: 'Kitchen', description: 'Kitchen cabinets and dining furniture' },
            { name: 'Office', description: 'Desks, chairs, and office furniture' },
        ];

        const categoryIds = {};
        for (const cat of categories) {
            const slug = generateSlug(cat.name);
            const { rows } = await pool.query(`
        INSERT INTO categories (name, slug, description, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = $1
        RETURNING id
      `, [cat.name, slug, cat.description, categories.indexOf(cat)]);
            categoryIds[cat.name] = rows[0].id;
        }
        logger.info('✅ Categories created');

        // ─── Create Sample Products ──────────────────────────────────
        const products = [
            {
                name: 'Modern Oak Wardrobe',
                sku: 'WRD-OAK-001',
                description: 'A stunning modern wardrobe crafted from premium oak wood. Features adjustable shelves, multiple compartments, and soft-close hinges. Perfect for organizing your bedroom with style.',
                short_description: 'Premium oak wardrobe with adjustable shelves',
                base_price: 1299.99,
                category: 'Closets',
                is_configurable: true,
                dimensions: { length: 180, width: 60, height: 220 },
            },
            {
                name: 'Luxury Velvet Sofa',
                sku: 'SOF-VLV-001',
                description: 'Sink into luxury with this deep-seated velvet sofa. Featuring premium foam cushioning, solid wood frame, and elegant gold-tipped legs. Available in multiple colors.',
                short_description: 'Deep-seated velvet sofa with gold accents',
                base_price: 2499.99,
                category: 'Living Room',
                is_configurable: true,
                dimensions: { length: 240, width: 95, height: 85 },
            },
            {
                name: 'Minimalist Platform Bed',
                sku: 'BED-MIN-001',
                description: 'Clean lines and minimalist design define this platform bed. Built with engineered wood and upholstered headboard. Includes under-bed storage.',
                short_description: 'Minimalist platform bed with storage',
                base_price: 899.99,
                category: 'Bedroom',
                is_configurable: true,
                dimensions: { length: 200, width: 160, height: 40 },
            },
            {
                name: 'Industrial Coffee Table',
                sku: 'TBL-IND-001',
                description: 'A bold industrial coffee table combining reclaimed wood and black iron frame. Features a lower shelf for magazines and remotes.',
                short_description: 'Reclaimed wood industrial coffee table',
                base_price: 449.99,
                category: 'Living Room',
                is_configurable: false,
                dimensions: { length: 120, width: 60, height: 45 },
            },
            {
                name: 'Custom Walk-In Closet',
                sku: 'CLO-WLK-001',
                description: 'Design your dream walk-in closet with our fully customizable system. Choose shelving, drawers, hanging rods, and finishes to create your perfect storage solution.',
                short_description: 'Fully customizable walk-in closet system',
                base_price: 3999.99,
                category: 'Closets',
                is_configurable: true,
                dimensions: { length: 300, width: 250, height: 240 },
            },
            {
                name: 'Ergonomic Office Chair',
                sku: 'CHR-ERG-001',
                description: 'Work in comfort with this premium ergonomic chair. Features adjustable lumbar support, breathable mesh back, and 4D armrests.',
                short_description: 'Premium ergonomic office chair',
                base_price: 699.99,
                category: 'Office',
                is_configurable: true,
                dimensions: { length: 70, width: 70, height: 120 },
            },
        ];

        const productIds = {};
        for (const prod of products) {
            const slug = generateSlug(prod.name);
            const { rows } = await pool.query(`
        INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, is_configurable, dimensions_cm)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (sku) DO UPDATE SET name = $1
        RETURNING id
      `, [prod.name, slug, prod.sku, prod.description, prod.short_description, prod.base_price, categoryIds[prod.category], prod.is_configurable, JSON.stringify(prod.dimensions)]);
            productIds[prod.name] = rows[0].id;
        }
        logger.info('✅ Products created');

        // ─── Create Configuration Options for Configurable Products ──
        // Wardrobe options
        const wardrobeId = productIds['Modern Oak Wardrobe'];
        if (wardrobeId) {
            const { rows: [colorOpt] } = await pool.query(
                `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                [wardrobeId, 'Color', 'color', 0]
            );
            const { rows: [materialOpt] } = await pool.query(
                `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                [wardrobeId, 'Material', 'material', 1]
            );
            const { rows: [sizeOpt] } = await pool.query(
                `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                [wardrobeId, 'Size', 'size', 2]
            );

            // Color values
            const colors = [
                { value: 'Natural Oak', adj: 0 },
                { value: 'Dark Walnut', adj: 50 },
                { value: 'White Wash', adj: 30 },
                { value: 'Charcoal', adj: 40 },
            ];
            for (const c of colors) {
                await pool.query(
                    `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                    [colorOpt.id, c.value, c.adj]
                );
            }

            // Material values
            const materials = [
                { value: 'Solid Oak', adj: 0 },
                { value: 'Oak Veneer', adj: -200 },
                { value: 'Premium Maple', adj: 150 },
            ];
            for (const m of materials) {
                await pool.query(
                    `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                    [materialOpt.id, m.value, m.adj]
                );
            }

            // Size values
            const sizes = [
                { value: 'Standard (180x60x220)', adj: 0 },
                { value: 'Large (240x60x220)', adj: 300 },
                { value: 'Extra Large (300x60x240)', adj: 600 },
            ];
            for (const s of sizes) {
                await pool.query(
                    `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                    [sizeOpt.id, s.value, s.adj]
                );
            }
        }

        // Sofa options
        const sofaId = productIds['Luxury Velvet Sofa'];
        if (sofaId) {
            const { rows: [colorOpt] } = await pool.query(
                `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                [sofaId, 'Color', 'color', 0]
            );
            const { rows: [sizeOpt] } = await pool.query(
                `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                [sofaId, 'Size', 'size', 1]
            );

            const sofaColors = [
                { value: 'Midnight Blue', adj: 0 },
                { value: 'Emerald Green', adj: 0 },
                { value: 'Dusty Rose', adj: 50 },
                { value: 'Charcoal Grey', adj: 0 },
                { value: 'Ivory White', adj: 100 },
            ];
            for (const c of sofaColors) {
                await pool.query(
                    `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                    [colorOpt.id, c.value, c.adj]
                );
            }

            const sofaSizes = [
                { value: '2-Seater', adj: -400 },
                { value: '3-Seater', adj: 0 },
                { value: 'L-Shape', adj: 800 },
            ];
            for (const s of sofaSizes) {
                await pool.query(
                    `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                    [sizeOpt.id, s.value, s.adj]
                );
            }
        }

        logger.info('✅ Configuration options & values created');
        logger.info('🎉 Database seeded successfully!');
        logger.info('');
        logger.info('──────────────────────────────────────────');
        logger.info('Admin Login:  admin@furniture-store.com / admin123');
        logger.info('Customer:     customer@test.com / customer123');
        logger.info('──────────────────────────────────────────');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();
