'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    ChevronLeft, Sparkles, Save, Trash2, AlertCircle,
    RefreshCcw, CheckCircle2, Loader2, Layers, DollarSign, Box
} from 'lucide-react';

export default function VariationsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const productId = params.id;

    const { data: productData, isLoading } = useQuery({
        queryKey: ['admin-product', productId],
        queryFn: () => api.getAdminProductDetail(productId),
        enabled: !!productId && productId !== 'undefined',
    });

    const [variations, setVariations] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Variation generating attributes
    const variationMakerAttrs = useMemo(() => {
        if (!productData?.product?.attributes) return [];
        return productData.product.attributes.filter((a: any) => a.is_variation_maker);
    }, [productData]);

    // Group values by attribute name
    const groupedAttributes = useMemo(() => {
        const groups: Record<string, any[]> = {};
        variationMakerAttrs.forEach((attr: any) => {
            if (!groups[attr.attribute_name]) groups[attr.attribute_name] = [];
            groups[attr.attribute_name].push(attr);
        });
        return groups;
    }, [variationMakerAttrs]);

    const generateVariations = () => {
        setIsGenerating(true);
        const attributeNames = Object.keys(groupedAttributes);
        if (attributeNames.length === 0) {
            setIsGenerating(false);
            return;
        }

        // Cartesian product generator
        const combinations: any[][] = [[]];
        attributeNames.forEach(name => {
            const temp: any[][] = [];
            combinations.forEach(combo => {
                groupedAttributes[name].forEach(attr => {
                    temp.push([...combo, attr]);
                });
            });
            combinations.splice(0, combinations.length, ...temp);
        });

        const newVariations = combinations.map((combo, idx) => {
            const combinedName = combo.map(c => c.value_name).join(' / ');
            const skuSuffix = combo.map(c => c.value_name.substring(0, 3).toUpperCase()).join('-');

            return {
                id: `new-${idx}`,
                value: combinedName,
                sku: `${productData.product.sku}-${skuSuffix}`,
                price_adjustment: 0,
                stock_quantity: 0,
                stock_status: 'in_stock',
                is_new: true,
                combo // Store the actual attribute IDs for backend linkage if needed
            };
        });

        setVariations(newVariations);
        setIsGenerating(false);
    };

    const updateVariation = (index: number, field: string, val: any) => {
        const next = [...variations];
        next[index] = { ...next[index], [field]: val };
        setVariations(next);
    };

    const removeVariation = (index: number) => {
        setVariations(variations.filter((_, i) => i !== index));
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            // This would call a new bulk endpoint or map to configuration_values
            // For now, let's assume we update the product's configurations
            // We'll need a backend endpoint for this.
            return api.adminUpdateProduct(productId, { configurations: variations });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
            router.push(`/admin/products/${productId}/edit`);
        }
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
            <p className="text-neutral-500 font-medium">Analyzing attributes...</p>
        </div>
    );

    const product = productData?.product;

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md pt-4 pb-4 mb-8 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-neutral-900">Variation Generator</h1>
                        <p className="text-sm font-medium text-neutral-500">Creating SKU combinations for {product?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending || variations.length === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Save Variations
                    </button>
                </div>
            </div>

            {variationMakerAttrs.length === 0 ? (
                <div className="p-12 text-center bg-white border border-dashed border-neutral-200 rounded-[32px] space-y-4">
                    <div className="inline-flex p-4 bg-orange-50 rounded-full text-primary-orange"><AlertCircle className="w-8 h-8" /></div>
                    <h2 className="text-xl font-black text-neutral-900">No Variation Attributes Selected</h2>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        To generate variations, go back to the <strong>Attributes</strong> tab and mark at least one attribute as "Creates Variation".
                    </p>
                    <button
                        onClick={() => router.push(`/admin/products/${productId}/edit`)}
                        className="mt-4 px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-sm shadow-md"
                    >
                        Back to Edit
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Control Panel */}
                    <div className="p-8 rounded-[32px] bg-white border border-neutral-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary-orange/10 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-primary-orange" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900">Auto-Generate Strategy</h2>
                                <p className="text-sm text-neutral-500">Generating based on: {Object.keys(groupedAttributes).join(', ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={generateVariations}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-orange text-white rounded-2xl font-black shadow-lg shadow-primary-orange/20 hover:bg-orange-600 active:scale-95 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4" /> Generate {Object.values(groupedAttributes).reduce((acc, curr) => acc * curr.length, 1)} Combinations
                        </button>
                    </div>

                    {/* Variations Grid */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-4">Generated SKU Variations ({variations.length})</h3>

                        <div className="grid grid-cols-1 gap-4">
                            {variations.map((v, idx) => (
                                <div key={v.id} className="p-6 bg-white border border-neutral-100 rounded-[24px] shadow-sm hover:border-primary-orange/30 transition-all flex flex-col md:flex-row items-stretch md:items-center gap-6">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Layers className="w-4 h-4 text-neutral-400" />
                                            <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Variant Name</span>
                                        </div>
                                        <input
                                            value={v.value}
                                            onChange={(e) => updateVariation(idx, 'value', e.target.value)}
                                            className="w-full bg-transparent border-none text-lg font-black text-neutral-900 outline-none p-0 focus:text-primary-orange transition-colors"
                                        />
                                    </div>

                                    <div className="w-full md:w-48">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Box className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Custom SKU</span>
                                        </div>
                                        <input
                                            value={v.sku}
                                            onChange={(e) => updateVariation(idx, 'sku', e.target.value)}
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl font-mono text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-orange/10"
                                        />
                                    </div>

                                    <div className="w-full md:w-32">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Price Adjust</span>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">+</span>
                                            <input
                                                type="number"
                                                value={v.price_adjustment}
                                                onChange={(e) => updateVariation(idx, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                                className="w-full pl-6 pr-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-orange/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full md:w-28">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Box className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Initial Stock</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={v.stock_quantity}
                                            onChange={(e) => updateVariation(idx, 'stock_quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl font-bold text-sm text-center outline-none focus:ring-2 focus:ring-primary-orange/10"
                                        />
                                    </div>

                                    <button
                                        onClick={() => removeVariation(idx)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors shadow-sm self-end md:self-center"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {variations.length === 0 && !isGenerating && (
                            <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-[32px] text-neutral-400">
                                <RefreshCcw className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">Ready to generate combinations.</p>
                                <p className="text-xs mt-1">Click the generate button above to start.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
