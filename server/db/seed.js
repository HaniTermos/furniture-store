require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcryptjs');
const { generateSlug } = require('../utils/generateSlug');
const logger = require('../utils/logger');

async function seedDatabase() {
    try {
<<<<<<< HEAD
        logger.info('🌱 Starting database seed...');
=======
        logger.info('🌱 Starting FULL database seed (Frontend + Backend data)...');
>>>>>>> d1d77d0 (dashboard and variants edits)

        // ─── Create Admin User ──────────────────────────────────────
        const adminPasswordHash = await bcrypt.hash('admin123', 12);
        const { rows: [adminUser] } = await pool.query(`
<<<<<<< HEAD
      INSERT INTO users (email, password_hash, name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `, ['admin@furniture-store.com', adminPasswordHash, 'Admin User', '+961 70 000000', 'admin']);
=======
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
            RETURNING *
        `, ['admin@furniture-store.com', adminPasswordHash, 'Admin User', '+961 70 000000', 'admin']);
>>>>>>> d1d77d0 (dashboard and variants edits)

        if (adminUser) {
            logger.info('✅ Admin user created: admin@furniture-store.com / admin123');
        } else {
            logger.info('ℹ️  Admin user already exists.');
        }

        // ─── Create Sample Customer ──────────────────────────────────
<<<<<<< HEAD
        const userPasswordHash = await bcrypt.hash('user123', 12);  // ✅ FIXED: variable name matches
=======
        const userPasswordHash = await bcrypt.hash('user123', 12);
>>>>>>> d1d77d0 (dashboard and variants edits)
        await pool.query(`
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
<<<<<<< HEAD
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
=======
        `, ['user@test.com', userPasswordHash, 'Test User', '+961 71 111111', 'user']);

        // ─── Create Manager User ─────────────────────────────────────
        const managerPasswordHash = await bcrypt.hash('manager123', 12);
        await pool.query(`
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `, ['manager@test.com', managerPasswordHash, 'Manager User', '+961 72 222222', 'manager']);

        // ─── Create Categories ───────────────────────────────────────
        const categoriesData = [
            { name: 'Living Room', description: 'Sofas, chairs, and tables for your living space' },
            { name: 'Dining', description: 'Tables, chairs, and buffets' },
            { name: 'Bedroom', description: 'Beds, nightstands, and dressers' },
            { name: 'Closets', description: 'Custom closets and storage solutions' },
            { name: 'Kitchen', description: 'Kitchen cabinets and dining furniture' },
            { name: 'Office', description: 'Desks, office chairs, and shelving' },
        ];

        const categoryIds = {};
        let i = 0;
        for (const cat of categoriesData) {
            const slug = generateSlug(cat.name);
            const { rows } = await pool.query(`
                INSERT INTO categories (name, slug, description, sort_order)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (slug) DO UPDATE SET name = $1
                RETURNING id
            `, [cat.name, slug, cat.description, i++]);
>>>>>>> d1d77d0 (dashboard and variants edits)
            categoryIds[cat.name] = rows[0].id;
        }
        logger.info('✅ Categories created');

<<<<<<< HEAD
        // ─── Create Sample Products ──────────────────────────────────
        const products = [
=======
        // ─── ALL PRODUCTS (Frontend + Backend Combined) ───────────
        const allProducts = [
            // FRONTEND SHOWCASE PRODUCTS (Featured on Homepage)
            {
                name: 'Luna Liven Lounge Chair',
                sku: 'LUNA-01',
                description: 'The Luna Lounge Chair is designed to invite rest and pause. With soft, curved edges and a solid ash wood frame, it fits seamlessly into small living spaces, reading corners, or bedrooms.',
                short_description: 'Soft curves meet timeless design.',
                base_price: 110,
                category: 'Living Room',
                is_configurable: true,
                is_featured: true,
                is_new: true,
                weight_kg: 15.5,
                dimensions_cm: { length: 75, width: 70, height: 85 },
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
                is_featured: true,
                is_new: false,
                weight_kg: 45.0,
                dimensions_cm: { length: 180, width: 90, height: 75 },
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
                is_featured: true,
                is_new: true,
                weight_kg: 35.0,
                dimensions_cm: { length: 120, width: 40, height: 180 },
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
                is_featured: true,
                is_new: false,
                weight_kg: 22.0,
                dimensions_cm: { length: 85, width: 85, height: 90 },
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
            },
            // BACKEND CATALOG PRODUCTS (Additional Inventory)
>>>>>>> d1d77d0 (dashboard and variants edits)
            {
                name: 'Modern Oak Wardrobe',
                sku: 'WRD-OAK-001',
                description: 'A stunning modern wardrobe crafted from premium oak wood. Features adjustable shelves, multiple compartments, and soft-close hinges. Perfect for organizing your bedroom with style.',
                short_description: 'Premium oak wardrobe with adjustable shelves',
                base_price: 1299.99,
                category: 'Closets',
                is_configurable: true,
<<<<<<< HEAD
                dimensions: { length: 180, width: 60, height: 220 },
=======
                is_featured: false,
                is_new: false,
                weight_kg: 85.0,
                dimensions_cm: { length: 180, width: 60, height: 220 },
                images: [],
                colors: [
                    { value: 'Natural Oak' },
                    { value: 'Dark Walnut' },
                    { value: 'White Wash' },
                    { value: 'Charcoal' },
                ],
                materials: [
                    { value: 'Solid Oak', adj: 0 },
                    { value: 'Oak Veneer', adj: -200 },
                    { value: 'Premium Maple', adj: 150 },
                ],
                sizes: [
                    { value: 'Standard (180x60x220)', adj: 0 },
                    { value: 'Large (240x60x220)', adj: 300 },
                    { value: 'Extra Large (300x60x240)', adj: 600 },
                ]
>>>>>>> d1d77d0 (dashboard and variants edits)
            },
            {
                name: 'Luxury Velvet Sofa',
                sku: 'SOF-VLV-001',
                description: 'Sink into luxury with this deep-seated velvet sofa. Featuring premium foam cushioning, solid wood frame, and elegant gold-tipped legs. Available in multiple colors.',
                short_description: 'Deep-seated velvet sofa with gold accents',
                base_price: 2499.99,
                category: 'Living Room',
                is_configurable: true,
<<<<<<< HEAD
                dimensions: { length: 240, width: 95, height: 85 },
=======
                is_featured: false,
                is_new: true,
                weight_kg: 65.0,
                dimensions_cm: { length: 240, width: 95, height: 85 },
                images: [],
                colors: [
                    { value: 'Midnight Blue' },
                    { value: 'Emerald Green' },
                    { value: 'Dusty Rose' },
                    { value: 'Charcoal Grey' },
                    { value: 'Ivory White' },
                ],
                sizes: [
                    { value: '2-Seater', adj: -400 },
                    { value: '3-Seater', adj: 0 },
                    { value: 'L-Shape', adj: 800 },
                ]
>>>>>>> d1d77d0 (dashboard and variants edits)
            },
            {
                name: 'Minimalist Platform Bed',
                sku: 'BED-MIN-001',
                description: 'Clean lines and minimalist design define this platform bed. Built with engineered wood and upholstered headboard. Includes under-bed storage.',
                short_description: 'Minimalist platform bed with storage',
                base_price: 899.99,
                category: 'Bedroom',
                is_configurable: true,
<<<<<<< HEAD
                dimensions: { length: 200, width: 160, height: 40 },
=======
                is_featured: false,
                is_new: false,
                weight_kg: 55.0,
                dimensions_cm: { length: 200, width: 160, height: 40 },
                images: [],
                colors: [
                    { value: 'Walnut' },
                    { value: 'White' },
                    { value: 'Black' },
                ],
                sizes: [
                    { value: 'Single', adj: -200 },
                    { value: 'Queen', adj: 0 },
                    { value: 'King', adj: 300 },
                ]
>>>>>>> d1d77d0 (dashboard and variants edits)
            },
            {
                name: 'Industrial Coffee Table',
                sku: 'TBL-IND-001',
                description: 'A bold industrial coffee table combining reclaimed wood and black iron frame. Features a lower shelf for magazines and remotes.',
                short_description: 'Reclaimed wood industrial coffee table',
                base_price: 449.99,
                category: 'Living Room',
                is_configurable: false,
<<<<<<< HEAD
                dimensions: { length: 120, width: 60, height: 45 },
=======
                is_featured: false,
                is_new: false,
                weight_kg: 25.0,
                dimensions_cm: { length: 120, width: 60, height: 45 },
                images: [],
                colors: [],
                sizes: []
>>>>>>> d1d77d0 (dashboard and variants edits)
            },
            {
                name: 'Custom Walk-In Closet',
                sku: 'CLO-WLK-001',
                description: 'Design your dream walk-in closet with our fully customizable system. Choose shelving, drawers, hanging rods, and finishes to create your perfect storage solution.',
                short_description: 'Fully customizable walk-in closet system',
                base_price: 3999.99,
                category: 'Closets',
                is_configurable: true,
<<<<<<< HEAD
                dimensions: { length: 300, width: 250, height: 240 },
=======
                is_featured: false,
                is_new: true,
                weight_kg: 150.0,
                dimensions_cm: { length: 300, width: 250, height: 240 },
                images: [],
                colors: [
                    { value: 'White' },
                    { value: 'Espresso' },
                    { value: 'Grey' },
                ],
                sizes: [
                    { value: 'Small (2.5m x 2m)', adj: -500 },
                    { value: 'Standard (3m x 2.5m)', adj: 0 },
                    { value: 'Large (4m x 3m)', adj: 1000 },
                ]
>>>>>>> d1d77d0 (dashboard and variants edits)
            },
            {
                name: 'Ergonomic Office Chair',
                sku: 'CHR-ERG-001',
                description: 'Work in comfort with this premium ergonomic chair. Features adjustable lumbar support, breathable mesh back, and 4D armrests.',
                short_description: 'Premium ergonomic office chair',
                base_price: 699.99,
                category: 'Office',
                is_configurable: true,
<<<<<<< HEAD
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
=======
                is_featured: false,
                is_new: false,
                weight_kg: 18.0,
                dimensions_cm: { length: 70, width: 70, height: 120 },
                images: [],
                colors: [
                    { value: 'Black' },
                    { value: 'Grey' },
                    { value: 'Blue' },
                ],
                sizes: [
                    { value: 'Standard', adj: 0 },
                    { value: 'Tall (for 6ft+)', adj: 50 },
                ]
            }
        ];

        // Insert all products
        for (const prod of allProducts) {
            const slug = generateSlug(prod.name);
            const { rows } = await pool.query(`
                INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, is_configurable, is_featured, is_new, weight_kg, dimensions_cm)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (sku) DO UPDATE SET 
                    name = $1, 
                    slug = $2, 
                    description = $4, 
                    short_description = $5, 
                    base_price = $6, 
                    category_id = $7, 
                    is_configurable = $8,
                    is_featured = $9,
                    is_new = $10,
                    weight_kg = $11,
                    dimensions_cm = $12
                RETURNING id
            `, [
                prod.name, 
                slug, 
                prod.sku, 
                prod.description, 
                prod.short_description, 
                prod.base_price, 
                categoryIds[prod.category], 
                prod.is_configurable, 
                prod.is_featured, 
                prod.is_new,
                prod.weight_kg || null,
                JSON.stringify(prod.dimensions_cm)
            ]);

            const productId = rows[0].id;

            // Clear existing images and re-insert
            await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);

            // Insert Images (if any)
            let imgSort = 0;
            for (const img of prod.images || []) {
                await pool.query(`
                    INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
                    VALUES ($1, $2, $3, $4, $5)
                `, [productId, img.url, img.alt, img.is_primary || false, imgSort++]);
            }

            // Clear existing config options
            await pool.query('DELETE FROM configuration_options WHERE product_id = $1', [productId]);

            // Insert Colors
            if (prod.colors && prod.colors.length > 0) {
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

            // Insert Materials (if any)
            if (prod.materials && prod.materials.length > 0) {
                const { rows: [materialOpt] } = await pool.query(
                    `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [productId, 'Material', 'material', 1]
                );
                for (const material of prod.materials) {
                    await pool.query(
                        `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                        [materialOpt.id, material.value, material.adj]
                    );
                }
            }

            // Insert Sizes
            if (prod.sizes && prod.sizes.length > 0) {
                const sortOrder = prod.materials ? 2 : 1;
                const { rows: [sizeOpt] } = await pool.query(
                    `INSERT INTO configuration_options (product_id, name, type, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [productId, 'Size', 'size', sortOrder]
                );
                for (const size of prod.sizes) {
                    await pool.query(
                        `INSERT INTO configuration_values (option_id, value, price_adjustment) VALUES ($1, $2, $3)`,
                        [sizeOpt.id, size.value, size.adj]
                    );
                }
            }
        }

        logger.info('✅ Products created:');
        logger.info('   - 4 Frontend showcase products (all featured)');
        logger.info('   - 6 Backend catalog products (additional inventory)');
        logger.info('   - Total: 10 products across 6 categories');

        // ─── Create Sample Orders ────────────────────────────────────
        const { rows: [testUser] } = await pool.query(`SELECT id FROM users WHERE email = 'user@test.com'`);
        if (testUser) {
            const { rows: [lunaChair] } = await pool.query(`SELECT id FROM products WHERE sku = 'LUNA-01'`);
            if (lunaChair) {
                const { rows: [order] } = await pool.query(`
                    INSERT INTO orders (order_number, user_id, status, payment_status, subtotal, total_amount, shipping_address, billing_address)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (order_number) DO NOTHING
                    RETURNING id
                `, [
                    'ORD-001-TEST',
                    testUser.id,
                    'delivered',
                    'completed',
                    110.00,
                    125.00,
                    JSON.stringify({ street: '123 Test St', city: 'Beirut', country: 'Lebanon' }),
                    JSON.stringify({ street: '123 Test St', city: 'Beirut', country: 'Lebanon' })
                ]);

                if (order) {
                    await pool.query(`
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_sku)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [order.id, lunaChair.id, 1, 110.00, 110.00, 'Luna Liven Lounge Chair', 'LUNA-01']);
                    logger.info('✅ Sample order created');
                }
            }
        }

        // ─── Create Sample Reviews ───────────────────────────────────
        const { rows: [lunaChair] } = await pool.query(`SELECT id FROM products WHERE sku = 'LUNA-01'`);
        if (lunaChair && testUser) {
            await pool.query(`
                INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase, is_approved)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT DO NOTHING
            `, [
                testUser.id,
                lunaChair.id,
                5,
                'Absolutely love this chair!',
                'The Luna chair is incredibly comfortable and looks amazing in my living room. Highly recommend!',
                true,
                true
            ]);
            logger.info('✅ Sample review created');
        }

        logger.info('');
        logger.info('🎉 FULL Database seeded successfully!');
        logger.info('');
        logger.info('══════════════════════════════════════════');
        logger.info('  USERS');
        logger.info('══════════════════════════════════════════');
        logger.info('Admin:    admin@furniture-store.com / admin123');
        logger.info('Manager:  manager@test.com / manager123');
        logger.info('Customer: user@test.com / user123');
        logger.info('');
        logger.info('══════════════════════════════════════════');
        logger.info('  CATALOG');
        logger.info('══════════════════════════════════════════');
        logger.info('Categories: 6 (Living Room, Dining, Bedroom, Closets, Kitchen, Office)');
        logger.info('Products:  10 total');
        logger.info('  - 4 Featured (show on homepage)');
        logger.info('  - 6 Additional (catalog inventory)');
        logger.info('');
        logger.info('══════════════════════════════════════════');
        logger.info('  DASHBOARD ACCESS');
        logger.info('══════════════════════════════════════════');
        logger.info('http://localhost:3000/admin/products');
        logger.info('');
        logger.info('You can now:');
        logger.info('  ✓ Edit any product (change prices, descriptions, images)');
        logger.info('  ✓ Add new products');
        logger.info('  ✓ Remove products');
        logger.info('  ✓ Manage orders and reviews');
        logger.info('  ✓ Toggle "Featured" status to control homepage display');
>>>>>>> d1d77d0 (dashboard and variants edits)

        process.exit(0);
    } catch (error) {
        logger.error('❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();
