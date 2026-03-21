'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, AlertCircle, ChevronDown } from 'lucide-react';
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

    // Sort attributes based on user preference: Color -> Size -> Material
    // or just use their sort_order/product_sort from backend
    const sortedAttributes = useMemo<ProductAttribute[]>(() => {
        return [...attributes].sort((a, b) => {
            const getRank = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('color')) return 1;
                if (n.includes('size')) return 2;
                if (n.includes('material')) return 3;
                return 4;
            };
            return getRank(a.name) - getRank(b.name);
        });
    }, [attributes]);

    // Find matching variant based on selections
    const selectedVariant = useMemo<ProductVariant | null>(() => {
        const selectedAttrIds = Object.keys(selectedOptions).filter(id => selectedOptions[id]);
        if (selectedAttrIds.length < sortedAttributes.length) return null;

        return variants.find(v =>
            v.is_active &&
            selectedAttrIds.every(attrId =>
                v.attributes.some(a =>
                    a.attribute_id === attrId && a.option_id === selectedOptions[attrId]
                )
            )
        ) || null;
    }, [variants, selectedOptions, sortedAttributes]);

    // Update parent when variant changes
    useEffect(() => {
        onVariantSelect(selectedVariant);
    }, [selectedVariant, onVariantSelect]);

    const handleOptionSelect = (attributeId: string, optionId: string) => {
        setSelectedOptions((prev: Record<string, string>) => {
            const next = { ...prev };
            next[attributeId] = optionId;
            
            // Clear subsequent attributes if this one changed
            const currentIndex = sortedAttributes.findIndex(a => a.id === attributeId);
            for (let i = currentIndex + 1; i < sortedAttributes.length; i++) {
                delete next[sortedAttributes[i].id];
            }
            
            return next;
        });
    };

    const isOptionAvailable = (attributeId: string, optionId: string) => {
        const currentIndex = sortedAttributes.findIndex(a => a.id === attributeId);
        const precedingSelections: Record<string, string> = {};
        for (let i = 0; i < currentIndex; i++) {
            const attr = sortedAttributes[i];
            if (selectedOptions[attr.id]) {
                precedingSelections[attr.id] = selectedOptions[attr.id];
            } else {
                return false; 
            }
        }

        return variants.some(v => 
            v.is_active &&
            Object.entries(precedingSelections).every(([attrId, optId]) => 
                v.attributes.some(a => a.attribute_id === attrId && a.option_id === optId)
            ) &&
            v.attributes.some(a => a.attribute_id === attributeId && a.option_id === optionId)
        );
    };

    const canAddToCart = selectedVariant && selectedVariant.stock_quantity >= quantity;

    return (
        <div className="space-y-8">
            {sortedAttributes.map((attr, index) => {
                const isPreviousSelected = index === 0 || !!selectedOptions[sortedAttributes[index - 1].id];
                const isSelected = !!selectedOptions[attr.id];
                const currentOption = attr.options.find(o => o.id === selectedOptions[attr.id]);

                if (!isPreviousSelected) return null;

                return (
                    <div key={attr.id} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Step {index + 1}: Select {attr.name}
                            </label>
                            {isSelected && (
                                <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {currentOption?.value}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attr.options.map((opt) => {
                                const isSelectedOption = selectedOptions[attr.id] === opt.id;
                                const isAvailable = isOptionAvailable(attr.id, opt.id);

                                if (attr.type === 'color' || attr.type === 'image') {
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => isAvailable && handleOptionSelect(attr.id, opt.id)}
                                            disabled={!isAvailable}
                                            className={`group relative w-12 h-12 rounded-full transition-all duration-300 ${
                                                isSelectedOption
                                                    ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110 shadow-lg'
                                                    : 'hover:scale-105'
                                            } ${!isAvailable ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'} overflow-hidden`}
                                            style={{ backgroundColor: !opt.image_url ? (opt.color_hex || '#ccc') : undefined }}
                                            title={opt.value}
                                        >
                                            {opt.image_url && (
                                                <img 
                                                    src={opt.image_url} 
                                                    alt={opt.value} 
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            {isSelectedOption && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Check className="w-5 h-5 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => isAvailable && handleOptionSelect(attr.id, opt.id)}
                                        disabled={!isAvailable}
                                        className={`px-6 py-3 rounded-full border text-sm font-medium tracking-tight transition-all duration-300 ${
                                            isSelectedOption
                                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl scale-105'
                                                : 'bg-white text-neutral-600 border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50'
                                        } ${!isAvailable ? 'opacity-30 cursor-not-allowed bg-neutral-50 border-transparent' : 'cursor-pointer'}`}
                                    >
                                        {opt.value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Stock & SKU Info */}
            <div className="pt-6 border-t border-neutral-100 space-y-4">
                {selectedVariant ? (
                    <div className="flex flex-col gap-2">
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                            selectedVariant.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {selectedVariant.stock_quantity > 0 ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    <span>In Stock ({selectedVariant.stock_quantity})</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Out of Stock</span>
                                </>
                            )}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono tracking-tighter">
                            MODEL ID: {selectedVariant.sku}
                        </div>
                    </div>
                ) : (
                    <div className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium italic">
                        Select configuration to see availability
                    </div>
                )}
            </div>

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-full px-2 py-1">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        -
                    </button>
                    <span className="w-10 text-center font-bold text-neutral-900">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={() => selectedVariant && canAddToCart && onAddToCart(selectedVariant, quantity)}
                    disabled={!canAddToCart}
                    className={`flex-1 py-4 px-8 rounded-full font-bold uppercase tracking-[0.2em] text-xs transition-all duration-500 ${
                        canAddToCart
                            ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xl hover:shadow-neutral-900/40'
                            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50'
                    }`}
                >
                    {canAddToCart
                        ? 'Add to Cart'
                        : !selectedVariant
                            ? 'Pick Options'
                            : 'Out of Stock'
                    }
                </button>
            </div>
        </div>
    );
}
