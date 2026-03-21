'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    ChevronLeft, Save, Plus, Trash2, Image as ImageIcon,
    AlertTriangle, Settings2, LayoutDashboard, Globe, Truck,
    Package, Tag as TagIcon, Loader2, ExternalLink, ChevronRight, Info,
    CheckCircle2, X, Upload
} from 'lucide-react';
import { useAppStore } from '@/store';

type TabType = 'general' | 'media' | 'attributes' | 'seo' | 'shipping';

export default function AdminProductEditPage({ params }: { params?: { id: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const productId = params?.id;
    const isEdit = !!productId && productId !== 'new' && productId !== 'undefined';

    useEffect(() => {
        if (productId === 'undefined') {
            router.replace('/admin/products');
        }
    }, [productId, router]);
    const { token } = useAppStore();

    const [activeTab, setActiveTab] = useState<TabType>('general');

    // --- FORM STATE ---
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [hasVariants, setHasVariants] = useState(false);

    // SEO
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    // Shipping & Physical
    const [weightKg, setWeightKg] = useState('');
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [sizeGuideId, setSizeGuideId] = useState('');

    // Tags & Attributes
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    // Media (We only keep track of images here, but focus on the primary one)
    const [images, setImages] = useState<any[]>([]);
    const [pendingImageUrl, setPendingImageUrl] = useState<string>('');

    // Stock (for non-configurable products)
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockStatus, setStockStatus] = useState('in_stock');
    const [lowStockThreshold, setLowStockThreshold] = useState('5');

    // Assigned Attributes (New Variant System)
    const [assignedAttributeIds, setAssignedAttributeIds] = useState<string[]>([]);

    // Validation & UX
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track whether initial data population is in progress
    const [isPopulating, setIsPopulating] = useState(true);

    const markDirty = useCallback(() => { if (!isDirty && !isPopulating) setIsDirty(true); }, [isDirty, isPopulating]);

    // Clear a single field error when user types
    const clearFieldError = useCallback((field: string) => {
        setFieldErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        markDirty();
    }, [markDirty]);

    // Unsaved changes guard
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // --- DATA FETCHING ---
    const { data: productData, isLoading: isProductLoading } = useQuery({
        queryKey: ['admin-product', productId],
        queryFn: () => api.getAdminProductDetail(productId!),
        enabled: isEdit && !!productId && productId !== 'undefined',
    });

    const { data: categories } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => api.getCategories(),
    });

    const { data: allTags } = useQuery({
        queryKey: ['admin-tags'],
        queryFn: () => api.getAdminTags(),
    });

    const { data: globalAttributes } = useQuery({
        queryKey: ['admin-global-attributes'],
        queryFn: () => api.getAttributes(),
    });

    const { data: sizeGuides } = useQuery({
        queryKey: ['admin-size-guides'],
        queryFn: () => api.getAdminSizeGuides(),
    });

    // Populate form
    useEffect(() => {
        if (isEdit && productData?.product) {
            setIsPopulating(true);
            const p = productData.product;
            setName(p.name || '');
            setSlug(p.slug || '');
            setSku(p.sku || '');
            setDescription(p.description || '');
            setShortDescription(p.short_description || '');
            setPrice(p.base_price?.toString() || '');
            setCategoryId(p.category_id || '');
            setIsActive(p.is_active);
            setIsFeatured(p.is_featured);
            setIsNew(p.is_new || false);
            setHasVariants(p.has_variants || false);
            setMetaTitle(p.meta_title || '');
            setMetaDescription(p.meta_description || '');
            setWeightKg(p.weight_kg?.toString() || '');
            setSizeGuideId(p.size_guide_id || '');

            if (p.dimensions_cm) {
                setDimensions(p.dimensions_cm);
            }

            setStockQuantity(p.stock_quantity?.toString() || '0');
            setStockStatus(p.stock_status || 'in_stock');
            setLowStockThreshold(p.low_stock_threshold?.toString() || '5');

            if (p.tags) {
                setSelectedTags(p.tags.map((t: any) => t.id).filter(Boolean));
            }

            if (p.images) {
                setImages(p.images.map((img: any) => ({
                    id: img.id,
                    image_url: img.url || img.image_url,
                    is_primary: img.is_primary,
                    sort_order: img.sort_order
                })));
            }

            if (p.attributes) {
                setAssignedAttributeIds(p.attributes.map((a: any) => a.id).filter(Boolean));
            }

            // Mark population complete after a tick so state setters flush
            setTimeout(() => {
                setIsPopulating(false);
                setIsDirty(false);
            }, 0);
        } else if (!isEdit) {
            setIsPopulating(false);
        }
    }, [productData, isEdit]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            setFieldErrors({});
            const payload: any = {
                name,
                slug,
                sku,
                description,
                short_description: shortDescription,
                base_price: parseFloat(price) || 0,
                category_id: categoryId || null,
                is_active: isActive,
                is_featured: isFeatured,
                is_new: isNew,
                has_variants: hasVariants,
                meta_title: metaTitle,
                meta_description: metaDescription,
                weight_kg: parseFloat(weightKg) || null,
                dimensions_cm: dimensions,
                size_guide_id: sizeGuideId || null,
                attributes: assignedAttributeIds.filter(id => id && id !== 'undefined'),
                tags: selectedTags.filter(id => id && id !== 'undefined'),
            };

            // Include stock fields for simple products
            if (!hasVariants) {
                payload.stock_quantity = parseInt(stockQuantity) || 0;
                payload.stock_status = stockStatus;
                payload.low_stock_threshold = parseInt(lowStockThreshold) || 5;
            }

            if (isEdit) {
                return api.adminUpdateProduct(productId!, payload);
            } else {
                // For new products, include any image uploaded before save
                if (pendingImageUrl) {
                    payload.images = [{
                        image_url: pendingImageUrl,
                        is_primary: true,
                        sort_order: 0
                    }];
                }
                const res = await api.adminCreateProduct(payload);
                // After creation, upload the pending image as a product image if we have one
                if (pendingImageUrl && res.product?.id) {
                    try {
                        const imgFormData = new FormData();
                        // We already uploaded the file, so create an image record with the URL
                        await api.adminUpdateProduct(res.product.id, {
                            images: [{ image_url: pendingImageUrl, is_primary: true, sort_order: 0 }]
                        });
                    } catch (_) { /* image attachment is best-effort */ }
                }
                return res;
            }
        },
        onSuccess: () => {
            setIsDirty(false);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
            toast.success('Product has been saved successfully', { duration: 3000 });
            router.push('/admin/products');
        },
        onError: (err: any) => {
            if (err instanceof ApiError && err.errors) {
                setFieldErrors(err.errors);
                toast.error('Please fix the highlighted errors');
            } else {
                toast.error(err?.message || 'Failed to save product');
            }
        },
    });

    const toggleTag = (id: string) => {
        setSelectedTags(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
        markDirty();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);

            if (productId && productId !== 'undefined') {
                // Existing product: upload directly as a product image
                formData.append('is_primary', 'true');
                formData.append('alt_text', name);
                const res = await api.uploadProductImage(productId, formData);
                setImages([{
                    id: res.image.id,
                    image_url: res.image.url,
                    is_primary: true,
                    sort_order: 0
                }]);
            } else {
                // New product: upload via admin generic endpoint, store URL for later
                const res = await api.adminUploadImage(formData);
                setPendingImageUrl(res.url);
                setImages([{
                    id: 'temp-pending',
                    image_url: res.url,
                    is_primary: true,
                    sort_order: 0
                }]);
            }
            markDirty();
            toast.success('Main image updated');
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    if (isEdit && isProductLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-orange" />
            <p className="font-medium animate-pulse">Loading product command center...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm mb-2 px-1">
                <Link href="/admin" className="text-neutral-400 hover:text-neutral-600 transition-colors font-medium">Dashboard</Link>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <Link href="/admin/products" className="text-neutral-400 hover:text-neutral-600 transition-colors font-medium">Products</Link>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-neutral-700 font-bold truncate max-w-[200px]">{isEdit ? (name || 'Loading...') : 'New Product'}</span>
            </nav>

            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md pt-4 pb-4 mb-8 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-neutral-900">{isEdit ? 'Refine Product' : 'Craft New Product'}</h1>
                        <p className="text-sm font-medium text-neutral-500">{isEdit ? `Modifying: ${name}` : 'Adding a new gem to the collection'}</p>
                    </div>
                    {isDirty && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Unsaved changes
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isEdit && slug && (
                        <a
                            href={`/shop/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 border border-neutral-200 bg-white text-neutral-600 rounded-2xl font-bold text-sm hover:bg-neutral-50 transition-colors shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View in Store
                        </a>
                    )}
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending || !name || (!hasVariants && !price)}
                        className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Publish Product'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-neutral-100/50 p-1.5 rounded-2xl border border-neutral-200 overflow-x-auto no-scrollbar">
                {[
                    { id: 'general', label: 'General Info', icon: LayoutDashboard },
                    { id: 'media', label: 'Main Media', icon: ImageIcon },
                    { id: 'attributes', label: 'Attributes', icon: Settings2 },
                    { id: 'seo', label: 'Search & SEO', icon: Globe },
                    { id: 'shipping', label: 'Inventory & Logistics', icon: Truck },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white text-primary-orange shadow-md border border-primary-orange/10'
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-orange' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* --- TAB: GENERAL --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary-orange" />
                                    Identity & Description
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Product Name <span className="text-red-500">*</span></label>
                                        <input
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                                            placeholder="e.g. Velvet Tufted Armchair"
                                            className={`w-full px-5 py-3.5 rounded-2xl border ${fieldErrors.name ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 focus:border-red-400' : 'border-neutral-100 bg-neutral-50 focus:ring-primary-orange/5 focus:border-primary-orange/30'} focus:bg-white focus:ring-4 outline-none transition-all text-lg font-bold`}
                                        />
                                        {fieldErrors.name && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{fieldErrors.name}</p>}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">SKU Code</label>
                                        <input
                                            value={sku}
                                            onChange={(e) => { setSku(e.target.value); markDirty(); }}
                                            placeholder="e.g. PROD-001"
                                            className="w-full px-5 py-3.5 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/30 transition-all text-lg font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Short Punchy Description</label>
                                        <input
                                            value={shortDescription}
                                            onChange={(e) => { setShortDescription(e.target.value); markDirty(); }}
                                            placeholder="A elegant piece for modern living rooms..."
                                            className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/30 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Story & Full Details</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => { setDescription(e.target.value); clearFieldError('description'); }}
                                            rows={8}
                                            placeholder="Crafted with sustainably sourced oak..."
                                            className={`w-full px-5 py-4 rounded-3xl border ${fieldErrors.description ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 focus:border-red-400' : 'border-neutral-100 bg-neutral-50 focus:ring-primary-orange/5 focus:border-primary-orange/30'} focus:bg-white focus:ring-4 transition-all font-medium resize-none`}
                                        />
                                        {fieldErrors.description && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{fieldErrors.description}</p>}
                                    </div>
                                    {/* Variant Logic toggle has been moved to the Attributes tab */}
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm">
                                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <TagIcon className="w-5 h-5 text-primary-orange" />
                                    Collections & Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {allTags?.map((tag: any) => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedTags.includes(tag.id)
                                                ? 'bg-primary-orange border-primary-orange text-white shadow-lg shadow-primary-orange/20 scale-105'
                                                : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                    {allTags?.length === 0 && <p className="text-sm text-neutral-400 italic">No tags defined yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: MEDIA (REFACTORED) --- */}
                    {activeTab === 'media' && (
                        <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary-orange" />
                                    Primary Display Image
                                </h2>
                                <p className="text-xs text-neutral-400 mt-1">This is the main image used in product listings. Secondary images should be uploaded per variant.</p>
                            </div>

                            <div className="relative aspect-[4/3] max-w-lg mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-neutral-200 bg-neutral-50 group">
                                {images.find(img => img.is_primary) ? (
                                    <>
                                        <img 
                                            src={images.find(img => img.is_primary).image_url} 
                                            alt="Primary" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer px-6 py-3 bg-white text-neutral-900 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-neutral-50 active:scale-95 transition-all">
                                                <Upload className="w-4 h-4" />
                                                Replace Image
                                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100/50 transition-colors">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 mb-4">
                                            <Plus className="w-8 h-8 text-primary-orange" />
                                        </div>
                                        <span className="text-sm font-black text-neutral-900">Upload Primary Image</span>
                                        <span className="text-xs text-neutral-400 mt-1">PNG, JPG up to 5MB</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                    </label>
                                )}
                            </div>
                            
                            <div className="p-4 bg-primary-orange/5 rounded-2xl border border-primary-orange/10 flex items-start gap-3">
                                <Info className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                                <p className="text-xs text-primary-orange font-medium leading-relaxed">
                                    <strong>Variant Images:</strong> With the new system enabled, you should upload specific images for each variation (Color, Size etc.) in the <strong>Manage Variants</strong> section. This main image will be the fallback.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: ATTRIBUTES --- */}
                    {activeTab === 'attributes' && (
                        <div className="space-y-6">
                            {/* Enable Variant Logic Toggle */}
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Enable Variant Logic</p>
                                            <p className="text-xs text-blue-500">Enable this if you want to use unique images/prices/stock per variant combination.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {hasVariants && isEdit && (
                                            <Link
                                                href={`/admin/products/${productId}/variants`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                Manage Variants
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setHasVariants(!hasVariants); markDirty(); }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ${hasVariants ? 'bg-blue-600 ring-blue-500' : 'bg-neutral-200 ring-transparent'}`}
                                        >
                                            <span className={`${hasVariants ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-sm`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                            <Settings2 className="w-5 h-5 text-primary-orange" />
                                            Product Attributes Matrix
                                        </h2>
                                        <p className="text-xs text-neutral-400 mt-1">Select which global dimensions define this product&apos;s variants.</p>
                                    </div>
                                    <Link
                                        href="/admin/attributes"
                                        className="text-xs font-bold text-primary-orange hover:underline flex items-center gap-1"
                                    >
                                        Global Pool <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                {hasVariants && (
                                    <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                                                <LayoutDashboard className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-blue-900 leading-tight">Variant Matrix Ready</p>
                                                <p className="text-xs text-blue-500 mt-1">Manage granular price &amp; stock per combination.</p>
                                            </div>
                                        </div>
                                        {isEdit ? (
                                            <Link
                                                href={`/admin/products/${productId}/variants`}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                            >
                                                Open Generator
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const res = await saveMutation.mutateAsync();
                                                        if (res.product?.id) {
                                                            router.push(`/admin/products/${res.product.id}/variants`);
                                                        }
                                                    } catch (_) { }
                                                }}
                                                disabled={saveMutation.isPending || !name}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                                            >
                                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Open Generator'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {globalAttributes?.map((attr: any) => {
                                            const isSelected = assignedAttributeIds.includes(attr.id);
                                            return (
                                                <button
                                                    key={attr.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setAssignedAttributeIds(prev => prev.filter(id => id !== attr.id));
                                                        } else {
                                                            setAssignedAttributeIds(prev => [...prev, attr.id]);
                                                        }
                                                        markDirty();
                                                    }}
                                                    className={`px-6 py-4 rounded-3xl border-2 transition-all flex flex-col items-start gap-1 ${isSelected
                                                        ? 'border-primary-orange bg-primary-orange/5 text-primary-orange shadow-lg shadow-primary-orange/5'
                                                        : 'border-neutral-50 bg-neutral-50 text-neutral-400 hover:border-neutral-100 hover:bg-neutral-100/50'
                                                        }`}
                                                >
                                                    <span className="text-xs font-black uppercase tracking-widest">{attr.name}</span>
                                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-primary-orange/60' : 'text-neutral-400'}`}>
                                                        {attr.type} • {attr.options_count || 0} values
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SEO --- */}
                    {activeTab === 'seo' && (
                        <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl"><Globe className="w-6 h-6 text-blue-500" /></div>
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900">Global Presence</h2>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">SEO Meta & Discovery Handles</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Meta Title</label>
                                    <input
                                        value={metaTitle}
                                        onChange={(e) => { setMetaTitle(e.target.value); markDirty(); }}
                                        placeholder={name}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Search Snippet (Meta Description)</label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => { setMetaDescription(e.target.value); markDirty(); }}
                                        rows={4}
                                        placeholder="Summarize the product for search engine results..."
                                        className="w-full px-5 py-4 rounded-3xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-medium resize-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">URL Handle (Slug)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-neutral-400 bg-neutral-100 px-4 py-4 rounded-2xl border border-neutral-100">/shop/</div>
                                        <input
                                            value={slug}
                                            onChange={(e) => { setSlug(e.target.value); markDirty(); }}
                                            placeholder="automatic"
                                            className="flex-1 px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-mono text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SHIPPING --- */}
                    {activeTab === 'shipping' && (
                        <div className="space-y-8">
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary-orange" />
                                    Logistics & Physical Specs
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Weight (KG)</label>
                                        <input
                                            type="number"
                                            value={weightKg}
                                            onChange={(e) => { setWeightKg(e.target.value); markDirty(); }}
                                            placeholder="0.0"
                                            className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Length (cm)</label>
                                            <input
                                                value={dimensions.length}
                                                onChange={(e) => { setDimensions({ ...dimensions, length: e.target.value }); markDirty(); }}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Width (cm)</label>
                                            <input
                                                value={dimensions.width}
                                                onChange={(e) => { setDimensions({ ...dimensions, width: e.target.value }); markDirty(); }}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Height (cm)</label>
                                            <input
                                                value={dimensions.height}
                                                onChange={(e) => { setDimensions({ ...dimensions, height: e.target.value }); markDirty(); }}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Management (Only if NO variants) */}
                            {!hasVariants && (
                                <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                    <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary-orange" />
                                        Inventory Control
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Available Quantity</label>
                                            <input
                                                type="number"
                                                value={stockQuantity}
                                                onChange={(e) => { setStockQuantity(e.target.value); markDirty(); }}
                                                className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Low Stock Alert at</label>
                                            <input
                                                type="number"
                                                value={lowStockThreshold}
                                                onChange={(e) => { setLowStockThreshold(e.target.value); markDirty(); }}
                                                className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Stock Status</label>
                                            <select
                                                value={stockStatus}
                                                onChange={(e) => { setStockStatus(e.target.value); markDirty(); }}
                                                className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none"
                                            >
                                                <option value="in_stock">In Stock</option>
                                                <option value="out_of_stock">Out of Stock</option>
                                                <option value="backordered">Backordered</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {hasVariants && (
                                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-6">
                                    <div className="p-4 bg-blue-100 rounded-2xl text-blue-600"><AlertTriangle className="w-8 h-8" /></div>
                                    <div>
                                        <h3 className="text-lg font-black text-blue-900">Inventory is decentralized</h3>
                                        <p className="text-sm text-blue-700/80 font-medium">Since Variant Logic is enabled, stock levels are managed individually for each product variation.</p>
                                        <Link href={`/admin/products/${productId}/variants`} className="mt-4 inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                                            Go to Variants Matrix <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Sticky Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-28 space-y-6">
                        <div className="p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Visibility & Listing</h3>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100 cursor-pointer hover:bg-neutral-100/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-900">Active</span>
                                        <span className="text-[10px] text-neutral-500 font-medium">Visible to customers</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => { setIsActive(e.target.checked); markDirty(); }}
                                        className="w-5 h-5 rounded-lg border-neutral-300 text-primary-orange focus:ring-primary-orange"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100 cursor-pointer hover:bg-neutral-100/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-900">Featured</span>
                                        <span className="text-[10px] text-neutral-500 font-medium">Show on homepage</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => { setIsFeatured(e.target.checked); markDirty(); }}
                                        className="w-5 h-5 rounded-lg border-neutral-300 text-primary-orange focus:ring-primary-orange"
                                    />
                                </label>
                            </div>
                        </div>

                        {hasVariants ? (
                            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Pricing Strategy</h3>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">Managed per Variant</p>
                                        <p className="text-xs text-blue-500">Prices are set individually for each variant combination.</p>
                                    </div>
                                </div>
                                {isEdit && (
                                    <Link
                                        href={`/admin/products/${productId}/variants`}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                    >
                                        Open Variant Pricing <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-neutral-500 mb-2 ml-1">Primary Collection</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => { setCategoryId(e.target.value); markDirty(); }}
                                        className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none"
                                    >
                                        <option value="">Uncategorized</option>
                                        {categories?.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Pricing Strategy</h3>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-neutral-500 mb-2 ml-1">Base Price ($)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => { setPrice(e.target.value); clearFieldError('price'); }}
                                        placeholder="0.00"
                                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-xl font-black text-neutral-900 focus:bg-white focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/30 outline-none transition-all"
                                    />
                                </div>
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-neutral-500 mb-2 ml-1">Primary Collection</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => { setCategoryId(e.target.value); markDirty(); }}
                                        className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none"
                                    >
                                        <option value="">Uncategorized</option>
                                        {categories?.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-orange rounded-xl"><Save className="w-5 h-5" /></div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Publish Status</h3>
                            </div>
                            <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-medium">
                                Last saved: {isEdit ? new Date(productData?.product?.updated_at || '').toLocaleString() : 'Never'}
                            </p>
                            <button
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || !name || (!hasVariants && !price)}
                                className="w-full py-4 bg-white text-neutral-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                Save Final Version
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
