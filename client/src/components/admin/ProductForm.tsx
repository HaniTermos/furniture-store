'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Loader2, ArrowLeft, Save, Plus, X, Upload, Image as ImageIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        sku: initialData?.sku || '',
        description: initialData?.description || '',
        short_description: initialData?.shortDescription || '',
        base_price: initialData?.price || '',
        category_id: initialData?.category_id || '',
        is_active: initialData?.is_active ?? true,
        is_featured: initialData?.isFeatured || false,
        is_new: initialData?.isNew || false,
        weight_kg: initialData?.details?.weight ? initialData.details.weight.replace(' kg', '') : '',
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || ''
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [swatches, setSwatches] = useState<any[]>(initialData?.configuration_options || []);
    const [isSaving, setIsSaving] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.getCategories(),
    });

    // Auto-generate slug from name if empty
    useEffect(() => {
        if (!isEditing && formData.name && !formData.slug) {
            setFormData(prev => ({ ...prev, slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
        }
    }, [formData.name, formData.slug, isEditing]);

    const mutation = useMutation({
        mutationFn: (data: typeof formData) => {
            const payload = {
                ...data,
                base_price: Number(data.base_price),
                weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
            };
            if (isEditing && initialData?.id) {
                return api.updateProduct(initialData.id, payload);
            }
            return api.createProduct(payload);
        },
        onSuccess: () => {
            router.push('/admin/products');
            router.refresh();
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    const addSwatch = () => {
        setSwatches(prev => [...prev, { name: 'New Option', type: 'color', values: [{ value: '#000000', label: 'Black', price_adjustment: 0, is_image: false, image_url: '' }] }]);
    };

    const updateSwatch = (index: number, field: string, value: any) => {
        const newSwatches = [...swatches];
        newSwatches[index][field] = value;
        setSwatches(newSwatches);
    };

    const removeSwatch = (index: number) => {
        setSwatches(prev => prev.filter((_, i) => i !== index));
    };

    const addSwatchValue = (swatchIndex: number) => {
        const newSwatches = [...swatches];
        const isColor = newSwatches[swatchIndex].type === 'color';
        newSwatches[swatchIndex].values.push({
            value: isColor ? '#000000' : '',
            label: '',
            price_adjustment: 0,
            is_image: false,
            image_url: ''
        });
        setSwatches(newSwatches);
    };

    const updateSwatchValue = (swatchIndex: number, valueIndex: number, field: string, value: any) => {
        const newSwatches = [...swatches];
        newSwatches[swatchIndex].values[valueIndex][field] = value;
        setSwatches(newSwatches);
    };

    const removeSwatchValue = (swatchIndex: number, valueIndex: number) => {
        const newSwatches = [...swatches];
        newSwatches[swatchIndex].values = newSwatches[swatchIndex].values.filter((_: any, i: number) => i !== valueIndex);
        setSwatches(newSwatches);
    };

    const handleSwatchImageUpload = async (swatchIndex: number, valueIndex: number, file: File) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await api.adminUploadImage(formData);
            updateSwatchValue(swatchIndex, valueIndex, 'image_url', res.url);
            updateSwatchValue(swatchIndex, valueIndex, 'is_image', true);
        } catch (err) {
            console.error('Failed to upload swatch image:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                base_price: Number(formData.base_price),
                weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
                is_configurable: swatches.length > 0
            };

            let productId = initialData?.id;

            if (isEditing && productId) {
                await api.updateProduct(productId, payload);
            } else {
                const res = await api.createProduct(payload);
                productId = res.product.id;
            }

            // Handle Images
            for (const image of images) {
                const imgFormData = new FormData();
                imgFormData.append('image', image);
                imgFormData.append('alt_text', formData.name);
                await api.uploadProductImage(productId, imgFormData);
            }

            // Handle Swatches (Config Options)
            if (!isEditing) {
                for (const swatch of swatches) {
                    const option = await api.createConfigurationOption({
                        product_id: productId,
                        name: swatch.name,
                        type: swatch.type,
                        is_required: true
                    });

                    for (const val of swatch.values) {
                        // For colors, we might want to store name|hex in value if not using the image fields correctly,
                        // but since the backend supports image_url, we'll use that for images.
                        // We'll store the label in 'value' and hex in a specific way if needed, or just use 'value' for both.
                        // Based on transformProduct: const [name, hex] = (v.value || '').split('|');
                        const combinedValue = swatch.type === 'color' ? `${val.label || 'Color'}|${val.value}` : val.value;

                        await api.createConfigurationValue({
                            option_id: option.id,
                            value: combinedValue,
                            price_adjustment: Number(val.price_adjustment) || 0,
                            image_url: val.image_url || null
                        });
                    }
                }
            }

            router.push('/admin/products');
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
                        <p className="text-neutral-500 text-sm mt-1">Fill in the product details below.</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </button>
            </div>

            {mutation.isError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    Failed to save product. Please check the required fields.
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Basic Information</h2>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Product Name <span className="text-red-500">*</span></label>
                            <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="e.g. Modern Lounge Chair" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">URL Slug <span className="text-red-500">*</span></label>
                            <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="e.g. modern-lounge-chair" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Product SKU <span className="text-red-500">*</span></label>
                            <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="e.g. CHR-MOD-01" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Short Description</label>
                            <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={2} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all resize-none" placeholder="A brief summary..." />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Full Description <span className="text-red-500">*</span></label>
                            <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all resize-none" placeholder="Detailed description of the product..." />
                        </div>
                    </div>

                    {/* SEO Insights */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
                        <h2 className="text-lg font-semibold">SEO Optimization</h2>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Meta Title</label>
                            <input name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="SEO Title (max 100 chars)" maxLength={100} />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Meta Description</label>
                            <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all resize-none" placeholder="SEO Description (max 255 chars)" maxLength={255} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Pricing & Structure */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Pricing & Status</h2>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Base Price (USD) <span className="text-red-500">*</span></label>
                            <input required type="number" step="0.01" min="0" name="base_price" value={formData.base_price} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="0.00" />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                            <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all appearance-none cursor-pointer">
                                <option value="">Select a category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Weight (kg)</label>
                            <input type="number" step="0.1" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange transition-all" placeholder="e.g. 15.5" />
                        </div>

                        <div className="pt-4 border-t border-neutral-100 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-primary-orange accent-primary-orange border-neutral-300 rounded" />
                                <span className="text-sm font-medium">Active (Visible)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-primary-orange accent-primary-orange border-neutral-300 rounded" />
                                <span className="text-sm font-medium">Featured Product</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                                <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} className="w-4 h-4 text-primary-orange accent-primary-orange border-neutral-300 rounded" />
                                <span className="text-sm font-medium">Mark as New</span>
                            </label>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Product Images</h2>
                            <label className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 p-2 rounded-xl transition-colors">
                                <Plus className="w-5 h-5 text-neutral-600" />
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>

                        {imagePreviews.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-neutral-100">
                                        <Image src={preview} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-video bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <p className="text-xs font-medium">No images uploaded yet</p>
                            </div>
                        )}
                        <p className="text-[10px] text-neutral-400">Recommended: 1200x1200px, PNG or JPG</p>
                    </div>

                    {/* Swatches (Configuration Options) */}
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Product Swatches</h2>
                            <button type="button" onClick={addSwatch} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                                <Plus className="w-5 h-5 text-neutral-600" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {swatches.map((swatch, sIdx) => (
                                <div key={sIdx} className="p-4 border border-neutral-200 rounded-2xl space-y-4 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeSwatch(sIdx)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid gap-4">
                                        <div className="grid gap-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Option Name</label>
                                            <input
                                                value={swatch.name}
                                                onChange={(e) => updateSwatch(sIdx, 'name', e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange"
                                                placeholder="e.g. Color, Size, Material"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Type</label>
                                            <select
                                                value={swatch.type}
                                                onChange={(e) => updateSwatch(sIdx, 'type', e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange appearance-none cursor-pointer"
                                            >
                                                <option value="color">Color Swatch</option>
                                                <option value="size">Size Selection</option>
                                                <option value="text">Custom Text</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Values</label>
                                        {swatch.values?.map((val: any, vIdx: number) => (
                                            <div key={vIdx} className="space-y-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 relative group">
                                                <button type="button" onClick={() => removeSwatchValue(sIdx, vIdx)} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-4 h-4" />
                                                </button>

                                                <div className="flex gap-4 items-start">
                                                    {swatch.type === 'color' && (
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Visual</label>
                                                            <div className="flex items-center gap-2">
                                                                <div className="relative">
                                                                    <input
                                                                        type="color"
                                                                        value={val.value || '#000000'}
                                                                        onChange={(e) => updateSwatchValue(sIdx, vIdx, 'value', e.target.value)}
                                                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                                                    />
                                                                </div>
                                                                <div className="h-10 w-px bg-neutral-200 mx-1" />
                                                                <label className="cursor-pointer flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-orange transition-colors">
                                                                    {val.image_url ? (
                                                                        <div className="relative w-full h-full rounded-md overflow-hidden">
                                                                            <Image src={val.image_url} alt="Swatch" fill className="object-cover" />
                                                                        </div>
                                                                    ) : (
                                                                        <Upload className="w-4 h-4 text-neutral-400" />
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => e.target.files?.[0] && handleSwatchImageUpload(sIdx, vIdx, e.target.files[0])}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Label</label>
                                                            <input
                                                                value={swatch.type === 'color' ? (val.label || '') : val.value}
                                                                onChange={(e) => updateSwatchValue(sIdx, vIdx, swatch.type === 'color' ? 'label' : 'value', e.target.value)}
                                                                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-orange"
                                                                placeholder={swatch.type === 'color' ? 'e.g. Oak, Velvet' : 'e.g. Large, 200cm'}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Price Adjustment</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={val.price_adjustment}
                                                                    onChange={(e) => updateSwatchValue(sIdx, vIdx, 'price_adjustment', e.target.value)}
                                                                    className="w-full bg-white border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:border-primary-orange"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addSwatchValue(sIdx)}
                                            className="text-primary-orange text-xs font-bold hover:underline flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Value
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
