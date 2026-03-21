const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ConfigurationOption = require('../models/ConfigurationOption');
const Review = require('../models/Review');
const ProductVariant = require('../models/ProductVariant');
const Attribute = require('../models/Attribute');
const { generateSlug, generateUniqueSlug } = require('../utils/generateSlug');
const imageService = require('../services/imageService');
const { validateMagicBytes } = require('../middleware/upload');

const productController = {
    /**
     * GET /api/products
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, category_id, search, sort, order, min_price, max_price } = req.query;
            const result = await Product.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 12,
                category_id,
                search,
                sort,
                order,
                minPrice: min_price ? parseFloat(min_price) : undefined,
                maxPrice: max_price ? parseFloat(max_price) : undefined,
            });

            if (result.products.length > 0) {
                const productIds = result.products.map(p => p.id);
                // Fetch legacy options (backward compat)
                const optionsMap = await ConfigurationOption.findWithValuesByProductIds(productIds);
                // Fetch new system attributes
                const attributesMap = await Attribute.findWithValuesByProductIds(productIds);

                result.products = result.products.map(p => ({
                    ...p,
                    configuration_options: optionsMap[p.id] || [],
                    attributes: attributesMap[p.id] || []
                }));
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/products/featured
     */
    async getFeatured(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const products = await Product.getFeatured(limit);

            if (products.length > 0) {
                const productIds = products.map(p => p.id);
                const optionsMap = await ConfigurationOption.findWithValuesByProductIds(productIds);
                const attributesMap = await Attribute.findWithValuesByProductIds(productIds);
                
                for (let p of products) {
                    p.configuration_options = optionsMap[p.id] || [];
                    p.attributes = attributesMap[p.id] || [];
                }
            }

            res.json({ products });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/products/:idOrSlug
     */
    async getOne(req, res, next) {
        try {
            const { idOrSlug } = req.params;
            // Try UUID first, then slug
            let product;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(idOrSlug)) {
                product = await Product.findById(idOrSlug);
            } else {
                product = await Product.findBySlug(idOrSlug);
            }

            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            // Get images, options, reviews, variants, and attributes
            const [images, options, reviewData, variants, attributes] = await Promise.all([
                ProductImage.findByProduct(product.id),
                ConfigurationOption.findWithValues(product.id),
                Review.findByProduct(product.id, { page: 1, limit: 5 }),
                ProductVariant.findByProduct(product.id),
                Attribute.getProductAttributes(product.id),
            ]);

            // Get related products
            const related = await Product.getRelated(product.id, product.category_id, 4);

            res.json({
                product: { 
                    ...product, 
                    images, // Gallery images (Frontend will decide whether to show them)
                    configuration_options: options,
                    variants: variants || [],
                    attributes: attributes || []
                },
                reviews: reviewData,
                relatedProducts: related,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/products/filters
     * Returns all unique attribute option names + values across active products
     */
    async getFilters(req, res, next) {
        try {
            const pool = require('../db/pool');
            const { rows } = await pool.query(`
                SELECT DISTINCT co.name AS option_name, co.type, cv.value, cv.image_url
                FROM configuration_options co
                JOIN configuration_values cv ON cv.option_id = co.id
                JOIN products p ON p.id = co.product_id
                WHERE p.is_active = true
                ORDER BY co.name, cv.value
            `);

            // Group by option name
            const filtersMap = new Map();
            for (const row of rows) {
                if (!filtersMap.has(row.option_name)) {
                    filtersMap.set(row.option_name, {
                        name: row.option_name,
                        type: row.type,
                        values: []
                    });
                }
                filtersMap.get(row.option_name).values.push({
                    value: row.value,
                    image_url: row.image_url || null
                });
            }

            res.json({ filters: Array.from(filtersMap.values()) });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/products (Admin)
     */
    async create(req, res, next) {
        try {
            const data = req.body;

            // Generate unique slug
            data.slug = await generateUniqueSlug(data.name, async (slug) => {
                return !!(await Product.findBySlug(slug));
            });

            const product = await Product.create(data);
            res.status(201).json({ message: 'Product created.', product });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/products/:id (Admin)
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const fields = req.body;

            if (fields.name) {
                fields.slug = await generateUniqueSlug(fields.name, async (slug) => {
                    const existing = await Product.findBySlug(slug);
                    return existing && existing.id !== id;
                });
            }

            const product = await Product.update(id, fields);
            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }
            res.json({ message: 'Product updated.', product });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/products/:id (Admin)
     */
    async delete(req, res, next) {
        try {
            const deleted = await Product.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Product not found.' });
            }
            res.json({ message: 'Product deleted.' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/products/:id/images (Admin)
     */
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided.' });
            }

            // Validate magic bytes to prevent spoofed Content-Type bypass
            try {
                validateMagicBytes(req.file.path);
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }

            const result = await imageService.upload(req.file, 'furniture-store/products');
            const image = await ProductImage.create({
                product_id: req.params.id,
                url: result.url,
                alt_text: req.body.alt_text || '',
                is_primary: req.body.is_primary === 'true',
                sort_order: parseInt(req.body.sort_order) || 0,
            });

            res.status(201).json({ message: 'Image uploaded.', image });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/products/:id/variants/:variantId/image (Admin)
     */
    async uploadVariantImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided.' });
            }
            const { id: variantId } = req.params;
            
            // Validate magic bytes
            try {
                validateMagicBytes(req.file.path);
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }

            const result = await imageService.upload(req.file, 'furniture-store/variants');
            
            const variant = await ProductVariant.update(variantId, {
                image_url: result.url,
                image_alt: req.body.alt_text || ''
            });

            if (!variant) {
                return res.status(404).json({ error: 'Variant not found.' });
            }

            res.status(200).json({ message: 'Variant image uploaded.', variant });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/products/:id/images/:imageId (Admin)
     */
    async deleteImage(req, res, next) {
        try {
            const image = await ProductImage.delete(req.params.imageId);
            if (!image) {
                return res.status(404).json({ error: 'Image not found.' });
            }
            // Clean up file from disk
            if (image.url) {
                imageService.delete(image.url).catch(() => {});
            }
            res.json({ message: 'Image deleted.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = productController;
