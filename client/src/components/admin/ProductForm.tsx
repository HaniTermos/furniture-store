'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
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
                    disabled={mutation.isPending}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                </div>
            </div>
        </form>
    );
}
