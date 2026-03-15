import React from 'react';
import type { Product } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface PriceDisplayProps {
    product: Product;
    className?: string;
}

export default function PriceDisplay({ product, className = "" }: PriceDisplayProps) {
    const { formatPrice } = useCurrency();

    if (product.has_variants && product.price_range) {
        if (product.price_range.min === product.price_range.max) {
             return <span className={`font-bold text-gray-900 ${className}`}>{formatPrice(product.price_range.min).display}</span>;
        }
        return (
            <span className={`font-bold text-gray-900 ${className}`}>
                {formatPrice(product.price_range.min).display} - {formatPrice(product.price_range.max).display}
            </span>
        );
    }
    
    if (product.display_price) {
        // If the backend sent a pre-formatted display_price string (e.g. "100.00 - 150.00")
        // Note: formatPrice only takes numbers, so if it's a string range we display it directly with currency symbol.
        const isStringRange = typeof product.display_price === 'string' && product.display_price.includes('-');
        if (isStringRange) {
             const parts = (product.display_price as string).split(' - ');
             const minFormatted = formatPrice(Number(parts[0])).display;
             const maxFormatted = formatPrice(Number(parts[1])).display;
             return <span className={`font-bold text-gray-900 ${className}`}>{minFormatted} - {maxFormatted}</span>;
        }
        return <span className={`font-bold text-gray-900 ${className}`}>{formatPrice(Number(product.display_price)).display}</span>;
    }

    return <span className={`font-bold text-gray-900 ${className}`}>{formatPrice(product.price || product.base_price || 0).display}</span>;
}
