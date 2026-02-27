// models/index.js — Central export for all models
const pool = require('../db/pool');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ConfigurationOption = require('./ConfigurationOption');
const ConfigurationValue = require('./ConfigurationValue');
const CartItem = require('./CartItem');
const SavedDesign = require('./SavedDesign');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');

module.exports = {
    pool,
    User,
    Category,
    Product,
    ProductImage,
    ConfigurationOption,
    ConfigurationValue,
    CartItem,
    SavedDesign,
    Order,
    OrderItem,
    Review,
};
