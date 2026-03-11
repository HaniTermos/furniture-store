'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    children?: Category[];
}

interface CategoryModalProps {
    category: Category | null;
    categories: Category[]; // Flat or tree structure, we will flatten it for the dropdown
    onClose: () => void;
    onSuccess: () => void;
}

export default function CategoryModal({ category, categories, onClose, onSuccess }: CategoryModalProps) {
    const { token } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        image_url: '',
        is_active: true,
        meta_title: '',
        meta_description: '',
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                parent_id: category.parent_id || '',
                image_url: category.image_url || '',
                is_active: category.is_active,
                meta_title: category.meta_title || '',
                meta_description: category.meta_description || '',
            });
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const endpoint = category
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${category.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`;

            const method = category ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                parent_id: formData.parent_id === '' ? null : formData.parent_id,
            };

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save category');

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const imgData = new FormData();
        imgData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/upload/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: imgData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFormData(prev => ({ ...prev, image_url: data.url }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    // Flatten tree to a usable array for the select options
    const flatOptions: { id: string; name: string; level: number }[] = [];
    const flatten = (cats: Category[], level = 0) => {
        for (const c of cats) {
            // Can't set itself or its own children as a parent
            if (category && c.id === category.id) continue;

            flatOptions.push({ id: c.id, name: c.name, level });
            if (c.children && c.children.length > 0) {
                flatten(c.children, level + 1);
            }
        }
    };
    flatten(categories);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#FAFAFA] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold">{category ? 'Edit Category' : 'Add Category'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="categoryForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold border-b pb-2">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                        placeholder="e.g. Living Room"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Slug (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Parent Category</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                >
                                    <option value="">None (Top Level)</option>
                                    {flatOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>
                                            {'\u00A0'.repeat(opt.level * 4)}
                                            {opt.level > 0 ? '↳ ' : ''}
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-primary-orange rounded border-neutral-300 focus:ring-primary-orange"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                    Category is Active
                                </label>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold border-b pb-2">Category Image</h3>

                            <div className="flex items-start gap-4">
                                {formData.image_url ? (
                                    <div className="relative w-32 h-32 rounded-xl border border-neutral-200 overflow-hidden bg-white">
                                        <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: '' })}
                                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg hover:bg-red-50 hover:text-red-500 shadow-sm transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-neutral-200 bg-white flex flex-col items-center justify-center text-neutral-400 gap-2">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                        <span className="text-xs font-medium">No Image</span>
                                    </div>
                                )}

                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Upload new image</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="category-image"
                                        />
                                        <label
                                            htmlFor="category-image"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 cursor-pointer transition-colors"
                                        >
                                            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {uploadingImage ? 'Uploading...' : 'Choose File'}
                                        </label>
                                    </div>
                                    <div className="text-xs text-neutral-400">Recommended size: 800x800px. Max 2MB.</div>
                                </div>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold border-b pb-2">Search Engine Optimization</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.meta_title}
                                    onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                />
                                <p className="text-xs text-neutral-500">Leave blank to use the category name.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meta Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.meta_description}
                                    onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="categoryForm"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {category ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}
