const { faker } = require('@faker-js/faker');

module.exports = {
    createUser: (overrides = {}) => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'ValidPass123!',
        phone: faker.phone.number(),
        ...overrides
    }),

    createProduct: (overrides = {}) => ({
        name: faker.commerce.productName(),
        slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
        sku: faker.string.alphanumeric(10).toUpperCase(),
        base_price: parseFloat(faker.commerce.price({ min: 100, max: 2000 })),
        category_id: null, // Should be overridden by the caller using an actual test category ID
        is_active: true,
        is_configurable: false,
        ...overrides
    })
};
