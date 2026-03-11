const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ConfigurationOption = require('../models/ConfigurationOption');
const Review = require('../models/Review');
const { generateSlug, generateUniqueSlug } = require('../utils/generateSlug');
const imageService = require('../services/imageService');

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
                const optionsMap = await ConfigurationOption.findWithValuesByProductIds(productIds);
                result.products = result.products.map(p => ({
                    ...p,
                    configuration_options: optionsMap[p.id] || []
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
                for (let p of products) {
                    p.configuration_options = optionsMap[p.id] || [];
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

            // Get images, options, reviews
            const [images, options, reviewData] = await Promise.all([
                ProductImage.findByProduct(product.id),
                ConfigurationOption.findWithValues(product.id),
                Review.findByProduct(product.id, { page: 1, limit: 5 }),
            ]);

            // Get related products
            const related = await Product.getRelated(product.id, product.category_id, 4);

            res.json({
                product: { ...product, images, configuration_options: options },
                reviews: reviewData,
                relatedProducts: related,
            });
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
