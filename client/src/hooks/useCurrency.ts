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
    const { usdToLbpRate, taxRate, shippingRates } = currencyConfig;

    const formatPrice = (priceInUsd: number) => {
        // Safety check for usdToLbpRate
        const effectiveUsdToLbpRate = usdToLbpRate && usdToLbpRate > 0 ? usdToLbpRate : 15000; // Default or fallback rate
        const lbpPrice = priceInUsd * effectiveUsdToLbpRate;

        const usdFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(priceInUsd);

        const lbpFormatted = new Intl.NumberFormat('en-LB', {
            style: 'currency',
            currency: 'LBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(lbpPrice);

        return {
            usd: usdFormatted,
            lbp: lbpFormatted,
            display: showLbp ? lbpFormatted : usdFormatted,
        };
    };

    const calculateTotal = (subtotalUsd: number, discountUsd: number = 0) => {
        // Safety check for taxRate
        const effectiveTaxRate = taxRate && taxRate >= 0 ? taxRate : 0;
        const taxUsd = subtotalUsd * effectiveTaxRate;
        
        // Dynamic shipping rate check
        const applicableRate = shippingRates.find(r => 
            subtotalUsd >= (r.minOrderValue || 0) && 
            (r.freeShippingThreshold === undefined || subtotalUsd < r.freeShippingThreshold)
        );
        
        const shippingUsd = applicableRate ? applicableRate.rate : 0;
        const totalUsd = Math.max(0, subtotalUsd + taxUsd + shippingUsd - discountUsd);

        return {
            subtotalUsd,
            taxUsd,
            shippingUsd,
            discountUsd,
            totalUsd,
            formatted: {
                subtotal: formatPrice(subtotalUsd),
                tax: formatPrice(taxUsd),
                shipping: formatPrice(shippingUsd),
                discount: formatPrice(discountUsd),
                total: formatPrice(totalUsd),
            },
        };
    };

    const convertToLbp = (usd: number) => usd * (usdToLbpRate || 90000);
    const calculateTax = (subtotal: number) => subtotal * (taxRate || 0);
    const calculateShipping = (subtotal: number, region = 'Lebanon') => {
        const rate = shippingRates.find((r) => r.region === region);
        if (!rate) return 0;
        if (rate.freeShippingThreshold && subtotal >= rate.freeShippingThreshold) return 0;
        return rate.rate;
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
