'use client';

import { useState, useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { ProductVariant, ProductAttribute } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface VariantSelectorProps {
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    basePrice: number;
    onVariantSelect: (variant: ProductVariant | null) => void;
    onAddToCart: (variant: ProductVariant, quantity: number) => void;
}

export default function VariantSelector({
    variants,
    attributes,
    basePrice,
    onVariantSelect,
    onAddToCart
}: VariantSelectorProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const { formatPrice } = useCurrency();

    // Get available options for each attribute based on current selections
    const getAvailableOptions = (attributeId: string) => {
        const otherSelections = { ...selectedOptions };
        delete otherSelections[attributeId];

        return variants
            .filter(v => v.is_active && v.stock_quantity > 0)
            .filter(v => {
                // Check if variant matches all other selected options
                return Object.entries(otherSelections).every(([attrId, optId]) =>
                    v.attributes.some(a => a.attribute_id === attrId && a.option_id === optId)
                );
            })
            .flatMap(v => v.attributes.filter(a => a.attribute_id === attributeId))
            .map(a => a.option_id);
    };

    // Find matching variant based on selections
    const selectedVariant = useMemo(() => {
        const selectedAttrIds = Object.keys(selectedOptions);
        if (selectedAttrIds.length === 0) return null;

        return variants.find(v =>
            v.is_active &&
            selectedAttrIds.every(attrId =>
                v.attributes.some(a =>
                    a.attribute_id === attrId && a.option_id === selectedOptions[attrId]
                )
            )
        ) || null;
    }, [variants, selectedOptions]);

    // Update parent when variant changes
    useMemo(() => {
        onVariantSelect(selectedVariant);
    }, [selectedVariant, onVariantSelect]);

    const handleOptionSelect = (attributeId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: prev[attributeId] === optionId ? '' : optionId
        }));
    };

    const isOptionAvailable = (attributeId: string, optionId: string) => {
        const available = getAvailableOptions(attributeId);
        return available.includes(optionId);
    };

    const canAddToCart = selectedVariant && selectedVariant.stock_quantity >= quantity;

    const currentPrice = selectedVariant?.price;

    return (
        <div className="space-y-6">
            {/* Price Display */}
            <div className="flex items-baseline gap-2">
                {selectedVariant ? (
                    <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(Number(currentPrice)).display}
                    </span>
                ) : (
                    <span className="text-3xl font-bold text-gray-900">
                        Select options for price
                    </span>
                )}
            </div>

            {/* Attribute Selectors */}
            {attributes.map((attr) => {
                const isSelected = selectedOptions[attr.id];
                
                return (
                    <div key={attr.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                {attr.name}
                            </label>
                            {isSelected && (
                                <span className="text-xs text-green-600 font-medium">
                                    Selected: {attr.options.find(o => o.id === isSelected)?.value}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {attr.options.map((opt) => {
                                const isSelectedOption = selectedOptions[attr.id] === opt.id;
                                const isAvailable = isOptionAvailable(attr.id, opt.id);

                                if (attr.type === 'color') {
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => isAvailable && handleOptionSelect(attr.id, opt.id)}
                                            disabled={!isAvailable}
                                            className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
                                                isSelectedOption
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                            style={{ backgroundColor: opt.color_hex || '#ccc' }}
                                            title={opt.value}
                                        >
                                            {isSelectedOption && (
                                                <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-md" />
                                            )}
                                            {!isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                if (attr.type === 'image') {
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => isAvailable && handleOptionSelect(attr.id, opt.id)}
                                            disabled={!isAvailable}
                                            className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                                                isSelectedOption
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title={opt.value}
                                        >
                                            {opt.image_url ? (
                                                <img
                                                    src={opt.image_url}
                                                    alt={opt.value}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    {opt.value}
                                                </div>
                                            )}
                                            {isSelectedOption && (
                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-blue-600" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                // Default: select/button type
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => isAvailable && handleOptionSelect(attr.id, opt.id)}
                                        disabled={!isAvailable}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            isSelectedOption
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                                    >
                                        {opt.value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Stock Status */}
            {selectedVariant ? (
                <div className={`flex items-center gap-2 text-sm ${
                    selectedVariant.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                    {selectedVariant.stock_quantity > 0 ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>In Stock ({selectedVariant.stock_quantity} available)</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Out of Stock</span>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Select all options to see availability</span>
                </div>
            )}

            {/* SKU Display */}
            {selectedVariant && (
                <div className="text-sm text-gray-500">
                    SKU: <span className="font-mono">{selectedVariant.sku}</span>
                </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 pt-4 border-t">
                <div className="flex items-center border rounded-lg">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                    >
                        -
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={() => selectedVariant && canAddToCart && onAddToCart(selectedVariant, quantity)}
                    disabled={!canAddToCart}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                        canAddToCart
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {canAddToCart
                        ? 'Add to Cart'
                        : !selectedVariant
                            ? 'Select Options'
                            : 'Out of Stock'
                    }
                </button>
            </div>
        </div>
    );
}

