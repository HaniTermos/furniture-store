const ConfigurationValue = require('../models/ConfigurationValue');

const priceService = {
    /**
     * Calculate total price from base_price + selected configuration value adjustments
     * @param {number} basePrice - Product base price
     * @param {object} configuration - Map of optionId → valueId
     * @returns {{ totalPrice: number, breakdown: Array }}
     */
    async calculatePrice(basePrice, configuration) {
        let totalAdjustment = 0;
        const breakdown = [{ label: 'Base Price', amount: parseFloat(basePrice) }];

        if (configuration && typeof configuration === 'object') {
            const valueIds = Object.values(configuration);
            if (valueIds.length > 0) {
                const values = await ConfigurationValue.findByIds(valueIds);
                for (const val of values) {
                    const adj = parseFloat(val.price_adjustment || 0);
                    if (adj !== 0) {
                        totalAdjustment += adj;
                        breakdown.push({ label: val.value, amount: adj });
                    }
                }
            }
        }

        const totalPrice = parseFloat(basePrice) + totalAdjustment;
        return {
            totalPrice: Math.max(0, parseFloat(totalPrice.toFixed(2))),
            breakdown,
        };
    },

    /**
     * Calculate order totals
     */
    calculateOrderTotals(subtotal, { taxRate = 0, shippingCost = 0, discountAmount = 0 } = {}) {
        const tax = parseFloat((subtotal * taxRate).toFixed(2));
        const total = parseFloat((subtotal + tax + shippingCost - discountAmount).toFixed(2));
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax_amount: tax,
            shipping_amount: parseFloat(shippingCost.toFixed(2)),
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            total_amount: Math.max(0, total),
        };
    },
};

module.exports = priceService;
