const pool = require('../db/pool');

const Product = {
    async create(data) {
        const {
<<<<<<< HEAD
            name, slug, sku, description, short_description, base_price,
            category_id, is_active = true, is_configurable = false,
=======
            category_id, is_active = true, is_configurable = false, has_variants = false,
>>>>>>> d1d77d0 (dashboard and variants edits)
            is_featured = false, is_new = false, weight_kg, dimensions_cm,
            meta_title, meta_description,
        } = data;
        const { rows } = await pool.query(
            `INSERT INTO products
        (name, slug, sku, description, short_description, base_price,
<<<<<<< HEAD
         category_id, is_active, is_configurable, is_featured, is_new,
         weight_kg, dimensions_cm, meta_title, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
            [name, slug, sku, description, short_description, base_price,
                category_id, is_active, is_configurable, is_featured, is_new,
=======
         category_id, is_active, is_configurable, has_variants, is_featured, is_new,
         weight_kg, dimensions_cm, meta_title, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
            [name, slug, sku, description, short_description, base_price,
                category_id, is_active, is_configurable, has_variants, is_featured, is_new,
>>>>>>> d1d77d0 (dashboard and variants edits)
                weight_kg, dimensions_cm ? JSON.stringify(dimensions_cm) : null,
                meta_title, meta_description]
        );
        return rows[0];
    },

    async findById(id) {
        const { rows } = await pool.query(
<<<<<<< HEAD
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug
=======
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             (SELECT get_product_price_range(p.id)) as price_range
>>>>>>> d1d77d0 (dashboard and variants edits)
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
            [id]
        );
<<<<<<< HEAD
        return rows[0] || null;
=======
        const product = rows[0] || null;
        if (product && product.has_variants) {
            const ProductVariant = require('./ProductVariant');
            product.variants = await ProductVariant.findByProduct(product.id);
            if (product.price_range && product.price_range.min !== null) {
                if (Number(product.price_range.min) === Number(product.price_range.max)) {
                    product.display_price = product.price_range.min;
                } else {
                    product.display_price = `${product.price_range.min} - ${product.price_range.max}`;
                }
            } else {
                product.display_price = product.base_price;
            }
        } else if (product) {
            product.display_price = product.base_price;
        }
        return product;
>>>>>>> d1d77d0 (dashboard and variants edits)
    },

    async findBySlug(slug) {
        const { rows } = await pool.query(
<<<<<<< HEAD
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug
=======
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             (SELECT get_product_price_range(p.id)) as price_range
>>>>>>> d1d77d0 (dashboard and variants edits)
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1`,
            [slug]
        );
<<<<<<< HEAD
        return rows[0] || null;
=======
        const product = rows[0] || null;
        if (product && product.has_variants) {
            const ProductVariant = require('./ProductVariant');
            product.variants = await ProductVariant.findByProduct(product.id);
            if (product.price_range && product.price_range.min !== null) {
                if (Number(product.price_range.min) === Number(product.price_range.max)) {
                    product.display_price = product.price_range.min;
                } else {
                    product.display_price = `${product.price_range.min} - ${product.price_range.max}`;
                }
            } else {
                product.display_price = product.base_price;
            }
        } else if (product) {
            product.display_price = product.base_price;
        }
        return product;
>>>>>>> d1d77d0 (dashboard and variants edits)
    },

    async findAll({ page = 1, limit = 12, category_id, search, sort = 'created_at', order = 'DESC', activeOnly = true, minPrice, maxPrice, isFeatured } = {}) {
        const conditions = [];
        const params = [];
        let paramIdx = 1;

        if (activeOnly) {
            conditions.push(`p.is_active = true`);
        }
        if (category_id) {
            conditions.push(`p.category_id = $${paramIdx++}`);
            params.push(category_id);
        }
        if (search) {
            conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        if (minPrice) {
            conditions.push(`p.base_price >= $${paramIdx++}`);
            params.push(minPrice);
        }
        if (maxPrice) {
            conditions.push(`p.base_price <= $${paramIdx++}`);
            params.push(maxPrice);
        }
        if (isFeatured !== undefined) {
            conditions.push(`p.is_featured = $${paramIdx++}`);
            params.push(isFeatured);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Safely whitelist sort columns to prevent SQL injection
        const VALID_SORTS = {
            'created_at': 'p.created_at',
            'base_price': 'p.base_price',
            'name': 'p.name'
        };
        const sortCol = VALID_SORTS[sort] || VALID_SORTS['created_at'];
        const sortOrder = ['ASC', 'DESC'].includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

        const offset = (page - 1) * limit;

        const dataQuery = `
      SELECT p.*, c.name AS category_name,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
<<<<<<< HEAD
=======
        (SELECT get_product_price_range(p.id)) as price_range,
>>>>>>> d1d77d0 (dashboard and variants edits)
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id AND is_approved = true) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = true) AS review_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${sortCol} ${sortOrder}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
        params.push(limit, offset);
        const { rows } = await pool.query(dataQuery, params);

        // Count query
        const countParams = params.slice(0, params.length - 2); // remove limit/offset
        const countQuery = `SELECT COUNT(*) FROM products p ${whereClause}`;
        const { rows: countRows } = await pool.query(countQuery, countParams);

        return {
            products: rows,
            total: parseInt(countRows[0].count),
            page,
            totalPages: Math.ceil(parseInt(countRows[0].count) / limit),
        };
    },

    async update(id, fields) {
        // Whitelist allowed fields to prevent SQL injection via keys
        const ALLOWED_FIELDS = [
            'name', 'slug', 'sku', 'description', 'short_description', 'base_price',
<<<<<<< HEAD
            'category_id', 'is_active', 'is_configurable', 'is_featured', 'is_new',
=======
            'category_id', 'is_active', 'is_configurable', 'has_variants', 'is_featured', 'is_new',
>>>>>>> d1d77d0 (dashboard and variants edits)
            'weight_kg', 'dimensions_cm', 'meta_title', 'meta_description'
        ];

        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => {
            if (k === 'dimensions_cm' && typeof fields[k] === 'object') {
                return JSON.stringify(fields[k]);
            }
            return fields[k];
        });
        const { rows } = await pool.query(
            `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async getFeatured(limit = 8) {
        const { rows } = await pool.query(
            `SELECT p.*,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id AND is_approved = true) AS avg_rating
       FROM products p
       WHERE p.is_featured = true AND p.is_active = true
       ORDER BY p.updated_at DESC
       LIMIT $1`,
            [limit]
        );
        return rows;
    },

    async getRelated(productId, categoryId, limit = 4) {
        const { rows } = await pool.query(
            `SELECT p.*,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image
       FROM products p
       WHERE p.category_id = $1 AND p.id != $2 AND p.is_active = true
       ORDER BY RANDOM()
       LIMIT $3`,
            [categoryId, productId, limit]
        );
        return rows;
    },
};

module.exports = Product;
