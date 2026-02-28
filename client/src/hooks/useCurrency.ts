import { useAppStore } from '@/store';

export function formatUsd(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatLbp(amount: number): string {
    return `LBP ${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)}`;
}

export function useCurrency() {
    const { currencyConfig, showLbp, toggleCurrency } = useAppStore();

    const convertToLbp = (usd: number) => usd * currencyConfig.usdToLbpRate;

    const formatPrice = (usdAmount: number) => ({
        usd: formatUsd(usdAmount),
        lbp: formatLbp(convertToLbp(usdAmount)),
        display: showLbp ? formatLbp(convertToLbp(usdAmount)) : formatUsd(usdAmount),
    });

    const calculateTax = (subtotal: number) => subtotal * currencyConfig.taxRate;

    const calculateShipping = (subtotal: number, region = 'Lebanon') => {
        const rate = currencyConfig.shippingRates.find((r) => r.region === region);
        if (!rate) return 0;
        if (rate.freeShippingThreshold && subtotal >= rate.freeShippingThreshold) return 0;
        return rate.rate;
    };

    const calculateTotal = (subtotal: number, region = 'Lebanon') => {
        const tax = calculateTax(subtotal);
        const shipping = calculateShipping(subtotal, region);
        const totalUsd = subtotal + tax + shipping;
        return {
            subtotalUsd: subtotal,
            taxUsd: tax,
            shippingUsd: shipping,
            totalUsd,
            totalLbp: convertToLbp(totalUsd),
            formatted: {
                subtotal: formatPrice(subtotal),
                tax: formatPrice(tax),
                shipping: formatPrice(shipping),
                total: formatPrice(totalUsd),
            },
        };
    };

    return {
        config: currencyConfig,
        showLbp,
        toggleCurrency,
        formatPrice,
        calculateTax,
        calculateShipping,
        calculateTotal,
        convertToLbp,
    };
}
