require('dotenv').config({ path: '../.env' });
const pool = require('./pool');
const { generateSlug } = require('../utils/generateSlug');
const bcrypt = require('bcryptjs');

async function clearDatabase() {
    console.log('🧹 Clearing existing store data...');
    // Clear in correct order due to foreign keys
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query("DELETE FROM users WHERE role = 'user'");
    await pool.query('DELETE FROM contact_messages');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM coupon_usages');
    await pool.query('DELETE FROM coupons');
    await pool.query('DELETE FROM product_tags');
    await pool.query('DELETE FROM tags');
    await pool.query('DELETE FROM cart_items');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM variant_attributes');
    await pool.query('DELETE FROM product_variants');
    await pool.query('DELETE FROM product_attributes');
    await pool.query('DELETE FROM attribute_options');
    await pool.query('DELETE FROM attributes');
    await pool.query('DELETE FROM product_images');
    await pool.query('DELETE FROM configuration_values');
    await pool.query('DELETE FROM configuration_options');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    console.log('✅ Store data cleared.');
}

async function seedUsers() {
    console.log('👤 Seeding users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await pool.query(`
        INSERT INTO users (email, password_hash, name, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
    `, ['admin@furniture-store.com', adminPasswordHash, 'Admin User', '+123456789', 'admin']);
    console.log('✅ Users seeded.');
}

async function seedData() {
    try {
        await clearDatabase();
        await seedUsers();

        console.log('🛋️ Seeding categories...');
        const categories = [
            { name: 'Living Room', description: 'Sofas, chairs, and tables for your living space' },
            { name: 'Dining Room', description: 'Tables, chairs, and buffets' },
            { name: 'Bedroom', description: 'Beds, nightstands, and dressers' },
            { name: 'Office', description: 'Desks, office chairs, and shelving' }
        ];

        const catMap = {};
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const { rows } = await pool.query(
                'INSERT INTO categories (name, slug, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
                [cat.name, generateSlug(cat.name), cat.description, i]
            );
            catMap[cat.name] = rows[0].id;
        }

        console.log('🎨 Seeding Global Attributes & Swatches...');
        
        // Color
        const { rows: [colorAttr] } = await pool.query(
            "INSERT INTO attributes (name, slug, type, is_used_for_variations, sort_order) VALUES ('Color', 'color', 'color', true, 0) RETURNING id"
        );
        const colors = [
            { val: 'Charcoal Black', hex: '#2A2A2A', slug: 'charcoal-black' },
            { val: 'Cloud White', hex: '#F5F5F5', slug: 'cloud-white' },
            { val: 'Navy Blue', hex: '#1C2938', slug: 'navy-blue' },
            { val: 'Emerald Green', hex: '#2A4B3C', slug: 'emerald-green' },
            { val: 'Sunset Orange', hex: '#E65C40', slug: 'sunset-orange' },
            { val: 'Oatmeal Beige', hex: '#D6CFC7', slug: 'oatmeal-beige' }
        ];
        const colorOpts = {};
        for (let i = 0; i < colors.length; i++) {
            const c = colors[i];
            const { rows } = await pool.query(
                "INSERT INTO attribute_options (attribute_id, value, slug, color_hex, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [colorAttr.id, c.val, c.slug, c.hex, i]
            );
            colorOpts[c.slug] = rows[0].id;
        }

        // Size
        const { rows: [sizeAttr] } = await pool.query(
            "INSERT INTO attributes (name, slug, type, is_used_for_variations, sort_order) VALUES ('Size', 'size', 'select', true, 1) RETURNING id"
        );
        const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
        const sizeOpts = {};
        for (let i = 0; i < sizes.length; i++) {
            const { rows } = await pool.query(
                "INSERT INTO attribute_options (attribute_id, value, slug, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
                [sizeAttr.id, sizes[i], generateSlug(sizes[i]), i]
            );
            sizeOpts[generateSlug(sizes[i])] = rows[0].id;
        }

        // Material
        const { rows: [materialAttr] } = await pool.query(
            "INSERT INTO attributes (name, slug, type, is_used_for_variations, sort_order) VALUES ('Material', 'material', 'select', true, 2) RETURNING id"
        );
        const materials = ['Solid Oak', 'Walnut Veneer', 'Velvet', 'Linen', 'Genuine Leather', 'Matte Metal'];
        const materialOpts = {};
        for (let i = 0; i < materials.length; i++) {
            const { rows } = await pool.query(
                "INSERT INTO attribute_options (attribute_id, value, slug, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
                [materialAttr.id, materials[i], generateSlug(materials[i]), i]
            );
            materialOpts[generateSlug(materials[i])] = rows[0].id;
        }

        console.log('📦 Seeding Rich Products & Variants...');

        const demoProducts = [
            {
                name: 'Luna Liven Lounge Chair',
                cat: 'Living Room',
                base_price: 249.00,
                desc: 'The Luna Lounge Chair is designed to invite rest and pause. With soft, curved edges and a solid ash wood frame, it fits seamlessly into modern living spaces.',
                short: 'Minimalist lounge perfection.',
                images: [
                    '/images/products/chair-orange-1.png', 
                    '/images/products/chair-orange-2.png', 
                    '/images/products/chair-orange-3.png', 
                    '/images/products/ai_luna_orange.jpg'
                ],
                attributes: [
                    { attrId: colorAttr.id, req: true, sort: 0 },
                    { attrId: materialAttr.id, req: true, sort: 1 }
                ],
                variants: [
                    { sku: 'LUNA-ORG-VEL', price: 249.00, stock: 15, options: { [colorAttr.id]: colorOpts['sunset-orange'], [materialAttr.id]: materialOpts['velvet'] } },
                    { sku: 'LUNA-BLK-LEA', price: 349.00, stock: 5, options: { [colorAttr.id]: colorOpts['charcoal-black'], [materialAttr.id]: materialOpts['genuine-leather'] } },
                    { sku: 'LUNA-GRN-VEL', price: 249.00, stock: 8, options: { [colorAttr.id]: colorOpts['emerald-green'], [materialAttr.id]: materialOpts['velvet'] } }
                ]
            },
            {
                name: 'Harmony Dining Table',
                cat: 'Dining Room',
                base_price: 899.00,
                desc: 'A beautifully simple dining table crafted from dense solid oak or walnut veneer. Tapered legs and a smooth finish make it perfect for family gatherings.',
                short: 'Gather around minimalist perfection.',
                images: ['/images/products/ai_harmony_table.jpg'],
                attributes: [
                    { attrId: sizeAttr.id, req: true, sort: 0 },
                    { attrId: materialAttr.id, req: true, sort: 1 }
                ],
                variants: [
                    { sku: 'HARM-SM-OAK', price: 899.00, stock: 20, options: { [sizeAttr.id]: sizeOpts['small'], [materialAttr.id]: materialOpts['solid-oak'] } },
                    { sku: 'HARM-LG-OAK', price: 1099.00, stock: 10, options: { [sizeAttr.id]: sizeOpts['large'], [materialAttr.id]: materialOpts['solid-oak'] } },
                    { sku: 'HARM-SM-WAL', price: 799.00, stock: 25, options: { [sizeAttr.id]: sizeOpts['small'], [materialAttr.id]: materialOpts['walnut-veneer'] } },
                    { sku: 'HARM-LG-WAL', price: 999.00, stock: 12, options: { [sizeAttr.id]: sizeOpts['large'], [materialAttr.id]: materialOpts['walnut-veneer'] } }
                ]
            },
            {
                name: 'Cloud Armchair',
                cat: 'Living Room',
                base_price: 499.00,
                desc: 'Sink into the Cloud Armchair. Its deep seat and plush cushioning transform any corner into a cozy retreat.',
                short: 'Deep seating for ultimate relaxation.',
                images: ['/images/products/ai_cloud_white.jpg', '/images/products/ai_cloud_navy.jpg'],
                attributes: [
                    { attrId: colorAttr.id, req: true, sort: 0 },
                    { attrId: sizeAttr.id, req: true, sort: 1 }
                ],
                variants: [
                    { sku: 'CLD-WHT-SM', price: 499.00, stock: 10, options: { [colorAttr.id]: colorOpts['cloud-white'], [sizeAttr.id]: sizeOpts['small'] } },
                    { sku: 'CLD-WHT-LG', price: 599.00, stock: 5, options: { [colorAttr.id]: colorOpts['cloud-white'], [sizeAttr.id]: sizeOpts['extra-large'] } },
                    { sku: 'CLD-NVY-SM', price: 499.00, stock: 14, options: { [colorAttr.id]: colorOpts['navy-blue'], [sizeAttr.id]: sizeOpts['small'] } },
                ]
            },
            {
                name: 'Minimalist Platform Bed',
                cat: 'Bedroom',
                base_price: 650.00,
                desc: 'Clean lines define this sturdy platform bed. Does not require a box spring. Includes subtle under-bed clearance for storage.',
                short: 'Sleep in sophisticated simplicity.',
                images: ['/images/products/ai_platform_bed.jpg'],
                attributes: [
                    { attrId: sizeAttr.id, req: true, sort: 0 },
                    { attrId: colorAttr.id, req: true, sort: 1 }
                ],
                variants: [
                    { sku: 'BED-MED-OAT', price: 650.00, stock: 30, options: { [sizeAttr.id]: sizeOpts['medium'], [colorAttr.id]: colorOpts['oatmeal-beige'] } },
                    { sku: 'BED-LRG-OAT', price: 750.00, stock: 20, options: { [sizeAttr.id]: sizeOpts['large'], [colorAttr.id]: colorOpts['oatmeal-beige'] } },
                    { sku: 'BED-MED-BLK', price: 650.00, stock: 15, options: { [sizeAttr.id]: sizeOpts['medium'], [colorAttr.id]: colorOpts['charcoal-black'] } }
                ]
            },
            {
                name: 'Serene Bookshelf',
                cat: 'Office',
                base_price: 189.00,
                desc: 'Open-concept bookshelf with asymmetric shelving. Perfect for displaying books, plants, and decorative objects.',
                short: 'Display with character.',
                images: ['/images/products/ai_serene_shelf.jpg'],
                attributes: [
                    { attrId: colorAttr.id, req: true, sort: 0 },
                    { attrId: materialAttr.id, req: true, sort: 1 }
                ],
                variants: [
                    { sku: 'SER-BLK-MTL', price: 189.00, stock: 40, options: { [colorAttr.id]: colorOpts['charcoal-black'], [materialAttr.id]: materialOpts['matte-metal'] } },
                    { sku: 'SER-WHT-MTL', price: 189.00, stock: 35, options: { [colorAttr.id]: colorOpts['cloud-white'], [materialAttr.id]: materialOpts['matte-metal'] } }
                ]
            }
        ];

        let skuCounter = 1;
        for (const prod of demoProducts) {
            console.log(`Creating Product: ${prod.name}`);
            const { rows } = await pool.query(`
                INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, has_variants, is_featured, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true)
                RETURNING id
            `, [prod.name, generateSlug(prod.name), `PROD-${String(skuCounter++).padStart(3, '0')}`, prod.desc, prod.short, prod.base_price, catMap[prod.cat]]);
            const prodId = rows[0].id;

            // Link Product Attributes
            for (const attr of prod.attributes) {
                await pool.query(
                    "INSERT INTO product_attributes (product_id, attribute_id, is_required, sort_order) VALUES ($1, $2, $3, $4)",
                    [prodId, attr.attrId, attr.req, attr.sort]
                );
            }

            // Create Variants
            for (const v of prod.variants) {
                const { rows: vRows } = await pool.query(
                    "INSERT INTO product_variants (product_id, sku, price, stock_quantity, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id",
                    [prodId, v.sku, v.price, v.stock]
                );
                const variantId = vRows[0].id;

                // Link Variant Attributes Options
                for (const [attrId, optId] of Object.entries(v.options)) {
                    await pool.query(
                        "INSERT INTO variant_attributes (variant_id, attribute_id, option_id) VALUES ($1, $2, $3)",
                        [variantId, attrId, optId]
                    );
                }
            }

            // Create Product Images
            if (prod.images && prod.images.length > 0) {
                for (let i = 0; i < prod.images.length; i++) {
                    await pool.query(
                        "INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES ($1, $2, $3, $4, $5)",
                        [prodId, prod.images[i], `${prod.name} Image ${i + 1}`, i === 0, i]
                    );
                }
            }
        }

        async function seedDashboardData() {
            console.log('📊 Seeding Dashboard Demo Data (Customers, Orders, Reviews)...');
            
            // 1. Generate Fake Customers
            const customers = [];
            for (let i = 1; i <= 10; i++) {
                const mockPasswordHash = await bcrypt.hash('password123', 10);
                const { rows } = await pool.query(`
                    INSERT INTO users (email, password_hash, name, role, is_active)
                    VALUES ($1, $2, $3, 'user', true)
                    RETURNING id
                `, [`customer${i}@example.com`, mockPasswordHash, `Demo Customer ${i}`]);
                customers.push(rows[0].id);
            }

            // Fetch products and variants
            const { rows: products } = await pool.query('SELECT id, name, sku FROM products');
            const { rows: variants } = await pool.query('SELECT id, product_id, sku, price FROM product_variants');

            // 2. Generate Orders spanning last 90 days
            const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            
            for (let i = 1; i <= 50; i++) {
                const customerId = customers[Math.floor(Math.random() * customers.length)];
                
                // Random date within the last 90 days
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 90));
                
                // Items
                const numItems = Math.floor(Math.random() * 3) + 1;
                let subtotal = 0;
                const orderItemsData = [];
                
                for (let j = 0; j < numItems; j++) {
                    const prod = products[Math.floor(Math.random() * products.length)];
                    const prodVariants = variants.filter(v => v.product_id === prod.id);
                    const selVariant = prodVariants.length > 0 ? prodVariants[Math.floor(Math.random() * prodVariants.length)] : null;
                    
                    const price = selVariant ? parseFloat(selVariant.price) : 100.00; 
                    const qty = Math.floor(Math.random() * 2) + 1;
                    subtotal += price * qty;
                    
                    orderItemsData.push({
                        productId: prod.id,
                        qty,
                        unitPrice: price,
                        totalPrice: price * qty,
                        productName: prod.name,
                        productSku: selVariant ? selVariant.sku : prod.sku
                    });
                }

                const tax = subtotal * 0.08;
                const shipping = subtotal > 500 ? 0 : 50;
                const total = subtotal + tax + shipping;

                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const orderNum = `ORD-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}-${String(i).padStart(4, '0')}`;

                const { rows: orderRows } = await pool.query(`
                    INSERT INTO orders (
                        order_number, user_id, status, payment_status, subtotal, tax_amount, shipping_amount, total_amount,
                        shipping_address, billing_address, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
                    RETURNING id
                `, [
                    orderNum, customerId, status, 
                    status === 'pending' || status === 'cancelled' ? 'pending' : 'completed',
                    subtotal, tax, shipping, total,
                    JSON.stringify({ city: 'Demo City', country: 'US' }),
                    JSON.stringify({ city: 'Demo City', country: 'US' }),
                    date.toISOString()
                ]);

                const orderId = orderRows[0].id;

                for (const item of orderItemsData) {
                    await pool.query(`
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name, product_sku)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [orderId, item.productId, item.qty, item.unitPrice, item.totalPrice, item.productName, item.productSku]);
                }
            }

            // 3. Generate Reviews
            const comments = [
                "Absolutely love this piece! The quality is amazing.",
                "Looks great in my living room, but assembly took a bit longer than expected.",
                "Highly recommended, very sturdy and premium feel.",
                "Exactly what I was looking for. Perfect fit.",
                "Good quality for the price.",
                "A bit darker than in the photos, but still beautiful."
            ];

            for (let i = 0; i < 20; i++) {
                const customerId = customers[Math.floor(Math.random() * customers.length)];
                const prod = products[Math.floor(Math.random() * products.length)];
                const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
                const comment = comments[Math.floor(Math.random() * comments.length)];
                
                await pool.query(`
                    INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase, is_approved)
                    VALUES ($1, $2, $3, $4, $5, true, true)
                `, [customerId, prod.id, rating, "Great Product", comment]);
            }

            // 4. Generate Product Tags
            console.log('🏷️ Seeding Tags...');
            const tagData = [
                { name: 'New Arrival', slug: 'new-arrival', desc: 'Freshly added to our collection' },
                { name: 'Bestseller', slug: 'bestseller', desc: 'Our most popular pieces' },
                { name: 'Eco-friendly', slug: 'eco-friendly', desc: 'Sustainably sourced and produced' },
                { name: 'Limited Edition', slug: 'limited-edition', desc: 'Exclusive designs, small batches' }
            ];

            const tagIds = [];
            for (const t of tagData) {
                const { rows } = await pool.query(`
                    INSERT INTO tags (name, slug, description)
                    VALUES ($1, $2, $3)
                    RETURNING id
                `, [t.name, t.slug, t.desc]);
                tagIds.push(rows[0].id);
            }

            // Link tags to random products
            for (const prod of products) {
                const numTags = Math.floor(Math.random() * 2) + 1;
                const shuffled = tagIds.sort(() => 0.5 - Math.random());
                for (let i = 0; i < numTags; i++) {
                    await pool.query(`
                        INSERT INTO product_tags (product_id, tag_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [prod.id, shuffled[i]]);
                }
            }

            // 5. Generate Contact Messages
            console.log('✉️ Seeding Contact Messages...');
            const inquiries = [
                { subject: 'Custom Order Inquiry', message: 'I love the Luna chair! Do you offer it in custom fabrics if I provide the material?' },
                { subject: 'Shipping to Europe', message: 'Do you ship to Germany? If so, what are the estimated shipping costs for a dining table?' },
                { subject: 'Wholesale Partnership', message: 'I am an interior designer in NYC. Do you have a trade program or wholesale pricing?' },
                { subject: 'Return Policy', message: 'What is your return policy for the Platform Bed if it doesn\'t fit my space?' },
                { subject: 'Assembly Service', message: 'Do you provide white-glove delivery and assembly services for the Serene Bookshelf?' }
            ];

            for (let i = 0; i < 15; i++) {
                const inq = inquiries[Math.floor(Math.random() * inquiries.length)];
                const status = ['unread', 'read', 'replied', 'archived'][Math.floor(Math.random() * 4)];
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30));

                await pool.query(`
                    INSERT INTO contact_messages (name, email, subject, message, status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    `Inquirer ${i + 1}`,
                    `inquiry${i + 1}@example.com`,
                    inq.subject,
                    inq.message,
                    status,
                    date.toISOString()
                ]);
            }

            // 6. Generate Notifications
            console.log('🔔 Seeding Notifications...');
            const adminUser = (await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).rows[0];
            if (adminUser) {
                const notifTypes = [
                    { type: 'order', title: 'New Order Received', message: 'Order #ORD-2026-0034 has been placed.' },
                    { type: 'stock', title: 'Low Stock Alert', message: 'Luna Lounge Chair is below threshold (2 left).' },
                    { type: 'review', title: 'New Review Posted', message: 'A customer left a 5-star review on Cloud Armchair.' },
                    { type: 'user', title: 'New Registration', message: 'A new customer has created an account.' }
                ];

                for (let i = 0; i < 10; i++) {
                    const nt = notifTypes[Math.floor(Math.random() * notifTypes.length)];
                    const isRead = Math.random() > 0.5;
                    const date = new Date();
                    date.setHours(date.getHours() - Math.floor(Math.random() * 48));

                    await pool.query(`
                        INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [adminUser.id, nt.type, nt.title, nt.message, isRead, date.toISOString()]);
                }
            }

            // 7. Generate Coupons
            console.log('🎟️ Seeding Coupons...');
            const coupons = [
                { code: 'WELCOME10', type: 'percentage', value: 10, usage_limit: 100, is_active: true },
                { code: 'FREESHIP', type: 'shipping', value: 0, usage_limit: null, is_active: true },
                { code: 'SAVE50', type: 'fixed', value: 50, usage_limit: 50, is_active: true },
                { code: 'EXPIRED20', type: 'percentage', value: 20, usage_limit: 10, is_active: false }
            ];

            for (const c of coupons) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + (c.is_active ? 30 : -30));

                await pool.query(`
                    INSERT INTO coupons (code, type, value, usage_limit, is_active, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [c.code, c.type, c.value, c.usage_limit, c.is_active, expiresAt.toISOString()]);
            }

            console.log('✅ Dashboard Demo Data Seeded.');
        }

        await seedDashboardData();

        console.log('✅ Full database seeded successfully with rich variants!');
        process.exit(0);

    } catch (e) {
        console.error('❌ SEED ERROR:', e);
        process.exit(1);
    }
}

seedData();
