'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
    Plus, Save, Trash2, RefreshCw, CheckCircle, 
    AlertCircle, ChevronLeft, LayoutDashboard, 
    Settings2, Boxes, Info, Wand2, X, Upload,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Variant {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    image_alt?: string;
    is_default: boolean;
    is_active: boolean;
    position: number;
    attributes: {
        attribute_id: string;
        attribute_name: string;
        attribute_slug: string;
        option_id: string;
        option_value: string;
        option_color?: string;
        option_image?: string;
    }[];
}

interface Attribute {
    id: string;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'image';
    options: {
        id: string;
        value: string;
        slug: string;
        color_hex?: string;
        image_url?: string;
    }[];
}

interface MatrixRow {
    tempId: string;
    sku: string;
    price: number;
    stock_quantity: number;
    image_url: string;
    is_default: boolean;
    is_active: boolean;
    combinations: Record<string, string>;
}

export default function ProductVariantsPage() {
    const { id: productId } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);
    const [matrix, setMatrix] = useState<MatrixRow[]>([]);
    const [showGenerator, setShowGenerator] = useState(false);
    const [manualSelections, setManualSelections] = useState<Record<string, string>>({});
    const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);

    // Fetch product
    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['admin-product', productId],
        queryFn: async () => {
            if (!productId || productId === 'new' || productId === 'undefined') return null;
            return await api.getAdminProductDetail(productId as string);
        },
        enabled: !!productId && productId !== 'new' && productId !== 'undefined'
    });

    const product = productData?.product;

    // Fetch all attributes
    const { data: attributes, isLoading: attrsLoading } = useQuery({
        queryKey: ['attributes'],
        queryFn: async () => {
            return await api.getAttributes();
        }
    });

    // Fetch existing variants
    const { data: variants, isLoading: variantsLoading } = useQuery({
        queryKey: ['product-variants', productId],
        queryFn: async () => {
            if (!productId || productId === 'new' || productId === 'undefined') return [];
            return await api.getProductVariants(productId as string);
        },
        enabled: !!productId && productId !== 'new' && productId !== 'undefined'
    });

    // Auto-select attributes assigned to the product
    useEffect(() => {
        if (product?.attributes && selectedAttrIds.length === 0) {
            const assignedIds = product.attributes.map((a: any) => a.attribute_id);
            setSelectedAttrIds(assignedIds);
        }
    }, [product, selectedAttrIds.length]);

    // Save matrix mutation
    const saveMatrix = useMutation({
        mutationFn: async (matrixData: MatrixRow[]) => {
            const matrix = matrixData.map(row => ({
                sku: row.sku,
                price: row.price,
                stock: row.stock_quantity,
                image_url: row.image_url || null,
                is_default: row.is_default,
                is_active: row.is_active,
                attributes: Object.entries(row.combinations).map(([attr_id, option_id]) => ({
                    attribute_id: attr_id,
                    option_id
                }))
            }));
            return await api.createVariantMatrix(productId as string, matrix);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variants saved successfully!');
            setMatrix([]);
            setShowGenerator(false);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to save variants');
        }
    });

    // Update variant mutation
    const updateVariant = useMutation({
        mutationFn: async ({ variantId, data }: { variantId: string; data: any }) => {
            return await api.updateProductVariant(productId as string, variantId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variant updated');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update variant');
        }
    });

    // Handle variant image upload
    const handleVariantImageUpload = async (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !productId) return;

        setUploadingVariantId(variantId);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            await api.uploadVariantImage(productId as string, variantId, formData);
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variant image updated');
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setUploadingVariantId(null);
        }
    };

    // Delete variant mutation
    const deleteVariant = useMutation({
        mutationFn: async (variantId: string) => {
            return await api.deleteProductVariant(productId as string, variantId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('Variant deleted');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to delete variant');
        }
    });

    const deleteAllVariants = useMutation({
        mutationFn: async () => {
            return await api.deleteAllProductVariants(productId as string);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
            toast.success('All variants deleted');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to delete variants');
        }
    });

    const selectedAttributes = useMemo(() => {
        return attributes?.filter((a: Attribute) => selectedAttrIds.includes(a.id)) || [];
    }, [attributes, selectedAttrIds]);

    const generateMatrix = () => {
        if (selectedAttributes.length === 0) {
            toast.error('Please select at least one attribute');
            return;
        }

        const attributeOptions = selectedAttributes.map((attr: Attribute) =>
            attr.options.map((opt) => ({
                attribute_id: attr.id,
                attribute_name: attr.name,
                option_id: opt.id,
                option_value: opt.value,
                option_color: opt.color_hex,
                option_image: opt.image_url
            }))
        );

        const combinations: any[][] = cartesianProduct(attributeOptions);
        
        const newMatrix: MatrixRow[] = combinations.map((combo, idx) => {
            const comboMap: Record<string, string> = {};
            const skuParts: string[] = [];
            
            combo.forEach((c: any) => {
                comboMap[c.attribute_id] = c.option_id;
                skuParts.push(c.option_value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase());
            });

            const prefix = product?.name?.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRD';
            
            return {
                tempId: `temp-${idx}`,
                sku: `${prefix}-${skuParts.join('-')}-${String(idx + 1).padStart(3, '0')}`,
                price: product?.base_price || 0,
                stock_quantity: 0,
                image_url: '',
                is_default: idx === 0,
                is_active: true,
                combinations: comboMap
            };
        });

        setMatrix(newMatrix);
    };

    const addManualVariant = () => {
        if (selectedAttributes.length === 0) {
            toast.error('Please select dimensions first');
            return;
        }

        // Check if all selected dimensions have a value picked
        const missingAttrs = selectedAttributes.filter(a => !manualSelections[a.id]);
        if (missingAttrs.length > 0) {
            toast.error(`Please select: ${missingAttrs.map(a => a.name).join(', ')}`);
            return;
        }

        const skuParts: string[] = [];
        const comboMap: Record<string, string> = { ...manualSelections };
        
        selectedAttributes.forEach(attr => {
            const opt = attr.options.find((o: any) => o.id === manualSelections[attr.id]);
            skuParts.push(opt?.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'XXX');
        });

        const prefix = product?.name?.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRD';
        const newTempId = `manual-${Date.now()}`;

        // Check if already in matrix
        const exists = matrix.some(row => 
            Object.entries(comboMap).every(([attrId, optId]) => row.combinations[attrId] === optId)
        );

        if (exists) {
            toast.error('This combination already exists in the preview');
            return;
        }

        const newRow: MatrixRow = {
            tempId: newTempId,
            sku: `${prefix}-${skuParts.join('-')}-${String(matrix.length + 1).padStart(3, '0')}`,
            price: product?.base_price || 0,
            stock_quantity: 0,
            image_url: '',
            is_default: matrix.length === 0,
            is_active: true,
            combinations: comboMap
        };

        setMatrix(prev => [...prev, newRow]);
        toast.success('Combination added to preview');
    };

    const updateRow = (tempId: string, field: keyof MatrixRow, value: any) => {
        setMatrix(prev => prev.map(row =>
            row.tempId === tempId ? { ...row, [field]: value } : row
        ));
    };

    const cartesianProduct = (arrays: any[][]): any[][] => {
        return arrays.reduce((acc, curr) =>
            acc.flatMap(a => curr.map(c => [...a, c])),
            [[]]
        );
    };

    const isLoading = productLoading || attrsLoading || variantsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-orange/20 border-t-primary-orange rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-neutral-400 animate-pulse">Loading Variant Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link 
                            href={`/admin/products/${productId}/edit`}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-primary-orange transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Product Edit
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                                <LayoutDashboard className="w-10 h-10 text-primary-orange" />
                                Variant Matrix
                            </h1>
                            <p className="text-neutral-400 font-medium">
                                Managing variants for <span className="text-neutral-900 font-bold">{product?.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {variants && variants.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you absolutely sure? This will delete all existing variants and cannot be undone.')) {
                                        deleteAllVariants.mutate();
                                    }
                                }}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                            >
                                <Trash2 className="w-4 h-4 inline mr-2" />
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={() => setShowGenerator(!showGenerator)}
                            className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                                showGenerator 
                                ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-200' 
                                : 'bg-primary-orange text-white hover:bg-primary-orange-dark shadow-primary-orange/20'
                            }`}
                        >
                            {showGenerator ? <X className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                            {showGenerator ? 'Close Generator' : 'Generate Matrix'}
                        </button>
                    </div>
                </div>

                {/* Generator Panel */}
                {showGenerator && (
                    <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-100 shadow-2xl shadow-neutral-100/50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
                            <div className="p-3 bg-primary-orange/10 rounded-2xl">
                                <Wand2 className="w-6 h-6 text-primary-orange" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-neutral-900">Matrix Generator</h2>
                                <p className="text-sm text-neutral-400">Configure combinations to generate a new set of variants.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 block">1. Select Variation Dimensions</label>
                                <div className="flex flex-wrap gap-3">
                                    {attributes?.map((attr: Attribute) => {
                                        const isSelected = selectedAttrIds.includes(attr.id);
                                        const isAssigned = product?.attributes?.some((a: any) => a.attribute_id === attr.id);
                                        
                                        return (
                                            <button
                                                key={attr.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedAttrIds(prev => prev.filter(id => id !== attr.id));
                                                    } else {
                                                        setSelectedAttrIds(prev => [...prev, attr.id]);
                                                    }
                                                }}
                                                className={`px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 min-w-[160px] relative ${
                                                    isSelected
                                                    ? 'border-primary-orange bg-primary-orange/5 text-primary-orange'
                                                    : 'border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-200'
                                                }`}
                                            >
                                                {isAssigned && !isSelected && (
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-black">
                                                        <Info className="w-2.5 h-2.5" /> ASSIGNED
                                                    </div>
                                                )}
                                                <span className="text-xs font-black uppercase tracking-widest leading-none">{attr.name}</span>
                                                <span className="text-[10px] font-bold opacity-60">
                                                    {attr.options?.length || 0} options
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedAttributes.length > 0 && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col gap-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                                    <Boxes className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-900">
                                                        Will generate {selectedAttributes.reduce((acc: number, attr: Attribute) => acc * (attr.options?.length || 1), 1)} total variations
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                        {selectedAttributes.map((a: Attribute) => a.name).join(' × ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={generateMatrix}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                            >
                                                <RefreshCw className="w-4 h-4 inline mr-2" />
                                                Bulk Generate Matrix
                                            </button>
                                        </div>

                                        <div className="h-px bg-blue-100 w-full" />

                                        {/* Manual Addition UI */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Option 2: Add Custom Combination</span>
                                                <div className="flex-1 h-[1px] bg-blue-100" />
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-4 items-end">
                                                {selectedAttributes.map((attr: Attribute) => (
                                                    <div key={attr.id} className="space-y-1.5 flex-1 min-w-[140px]">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">{attr.name}</label>
                                                        <select
                                                            value={manualSelections[attr.id] || ''}
                                                            onChange={(e) => setManualSelections(prev => ({ ...prev, [attr.id]: e.target.value }))}
                                                            className="w-full px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-blue-200"
                                                        >
                                                            <option value="">Select {attr.name}...</option>
                                                            {attr.options.map(opt => (
                                                                <option key={opt.id} value={opt.id}>{opt.value}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={addManualVariant}
                                                    className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 h-[38px]"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add to Preview
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            {matrix.length > 0 && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Generated Preview</h3>
                                        <button
                                            onClick={() => saveMatrix.mutate(matrix)}
                                            disabled={saveMatrix.isPending}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50"
                                        >
                                            {saveMatrix.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                            {saveMatrix.isPending ? 'Committing...' : 'Commit to Database'}
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto overflow-y-hidden rounded-[2rem] border border-neutral-100 shadow-sm bg-neutral-50/30 pb-2">
                                        <table className="min-w-max w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50/50">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 w-16">Def</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Configurations</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">SKU / Price / Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {matrix.map((row) => (
                                                    <tr key={row.tempId} className="bg-white hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="radio"
                                                                id={`default-variant-${row.tempId}`}
                                                                name="default_variant"
                                                                checked={row.is_default}
                                                                onChange={() => {
                                                                    setMatrix(prev => prev.map(r => ({
                                                                        ...r,
                                                                        is_default: r.tempId === row.tempId
                                                                    })));
                                                                }}
                                                                className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-2 max-w-sm lg:max-w-md">
                                                                {selectedAttributes.map((attr: Attribute) => {
                                                                    const optId = row.combinations[attr.id];
                                                                    const opt = attr.options.find(o => o.id === optId);
                                                                    if (!opt) return null;
                                                                    return (
                                                                        <div 
                                                                            key={attr.id}
                                                                            className="px-2.5 py-1.5 bg-neutral-100 rounded-xl flex items-center gap-2 border border-neutral-200/50"
                                                                        >
                                                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{attr.name}</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                {attr.type === 'color' && opt.color_hex && (
                                                                                    <div className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: opt.color_hex }} />
                                                                                )}
                                                                                <span className="text-xs font-bold text-neutral-700">{opt.value}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    id={`sku-${row.tempId}`}
                                                                    name={`sku-${row.tempId}`}
                                                                    value={row.sku}
                                                                    onChange={(e) => updateRow(row.tempId, 'sku', e.target.value)}
                                                                    className="w-32 px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-primary-orange/20"
                                                                />
                                                                <div className="relative">
                                                                    <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-neutral-400">$</span>
                                                                    <input
                                                                        id={`price-${row.tempId}`}
                                                                        name={`price-${row.tempId}`}
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={row.price}
                                                                        onChange={(e) => updateRow(row.tempId, 'price', parseFloat(e.target.value))}
                                                                        className="w-24 pl-5 pr-2 py-1.5 bg-neutral-50 border border-neutral-100 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary-orange/20"
                                                                    />
                                                                </div>
                                                                <input
                                                                    id={`stock-${row.tempId}`}
                                                                    name={`stock-${row.tempId}`}
                                                                    type="number"
                                                                    placeholder="Stock"
                                                                    value={row.stock_quantity}
                                                                    onChange={(e) => updateRow(row.tempId, 'stock_quantity', parseInt(e.target.value))}
                                                                    className="w-20 px-2 py-1.5 bg-neutral-50 border border-neutral-100 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-primary-orange/20"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Existing Variants List */}
                <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-100 shadow-xl shadow-neutral-100/30 overflow-hidden">
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-50 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-500">
                                <Boxes className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-neutral-900">Current Variations</h2>
                                <p className="text-sm text-neutral-400">{variants?.length || 0} active configurations in database.</p>
                            </div>
                        </div>
                    </div>

                    {variants && variants.length > 0 ? (
                        <div className="overflow-x-auto -mx-8 px-8 pb-4 custom-scrollbar">
                            <table className="min-w-max w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Media</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Identity</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Configurations</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Pricing & Inventory</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-neutral-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {variants.map((variant: Variant) => (
                                        <tr key={variant.id} className="hover:bg-neutral-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                                                    {variant.image_url ? (
                                                        <img src={variant.image_url} alt={variant.sku} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                        {uploadingVariantId === variant.id ? (
                                                            <RefreshCw className="w-5 h-5 text-white animate-spin" />
                                                        ) : (
                                                            <Upload className="w-5 h-5 text-white" />
                                                        )}
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            disabled={uploadingVariantId === variant.id}
                                                            onChange={(e) => handleVariantImageUpload(variant.id, e)} 
                                                        />
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    {variant.is_default ? (
                                                        <div className="p-1.5 bg-green-100 text-green-600 rounded-lg" title="Default Variant">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => updateVariant.mutate({ variantId: variant.id, data: { is_default: true } })}
                                                            className="p-1.5 bg-neutral-100 text-neutral-400 rounded-lg hover:text-green-600 hover:bg-green-50 transition-colors"
                                                            title="Set as Default"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-neutral-900 font-mono tracking-tight">{variant.sku}</span>
                                                        {variant.is_default && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Main Default</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {variant.attributes?.map((attr) => (
                                                        <div 
                                                            key={attr.attribute_id}
                                                            className="px-2.5 py-1.5 bg-neutral-100 rounded-xl flex items-center gap-2 border border-neutral-200/50"
                                                        >
                                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{attr.attribute_name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {attr.option_color && (
                                                                    <div className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: attr.option_color }} />
                                                                )}
                                                                <span className="text-xs font-bold text-neutral-700">{attr.option_value}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">Price</span>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1.5 text-[10px] font-bold text-neutral-400">$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={variant.price}
                                                                onBlur={(e) => updateVariant.mutate({
                                                                    variantId: variant.id,
                                                                    data: { price: parseFloat(e.target.value) }
                                                                })}
                                                                className="w-24 pl-5 pr-2 py-1.5 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-orange/20"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">In Stock</span>
                                                        <input
                                                            type="number"
                                                            defaultValue={variant.stock_quantity}
                                                            onBlur={(e) => updateVariant.mutate({
                                                                variantId: variant.id,
                                                                data: { stock_quantity: parseInt(e.target.value) }
                                                            })}
                                                            className={`w-20 px-2 py-1.5 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-center outline-none focus:ring-2 focus:ring-primary-orange/20 ${
                                                                variant.stock_quantity <= 0 ? 'text-red-500' : 'text-neutral-700'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => updateVariant.mutate({
                                                        variantId: variant.id,
                                                        data: { is_active: !variant.is_active }
                                                    })}
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        variant.is_active
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                                                    }`}
                                                >
                                                    {variant.is_active ? 'Active' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this variant?')) {
                                                            deleteVariant.mutate(variant.id);
                                                        }
                                                    }}
                                                    className="p-2.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-4">
                            <div className="w-20 h-20 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto border border-neutral-100 text-neutral-200">
                                <Boxes className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-neutral-900 tracking-tight">No Variations Defined</h3>
                                <p className="text-sm text-neutral-400 max-w-[280px] mx-auto">
                                    Use the generator engine above to create your first variant matrix.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGenerator(true)}
                                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
                            >
                                Start Generating
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
