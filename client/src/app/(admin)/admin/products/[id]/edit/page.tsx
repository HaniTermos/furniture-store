'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
<<<<<<< HEAD
    ChevronLeft, Save, Plus, Trash2, Image as ImageIcon, CheckCircle2,
    AlertTriangle, ListPlus, Settings2, LayoutDashboard, Globe, Truck,
    Package, Ruler, Tag as TagIcon, Loader2
=======
    ChevronLeft, Save, Plus, Trash2, Image as ImageIcon,
    AlertTriangle, Settings2, LayoutDashboard, Globe, Truck,
    Package, Ruler, Tag as TagIcon, Loader2, ExternalLink, ChevronRight, Info
>>>>>>> d1d77d0 (dashboard and variants edits)
} from 'lucide-react';
import { useAppStore } from '@/store';

// Components
import ProductGallery from './components/ProductGallery';
<<<<<<< HEAD
import AttributeSelection from './components/AttributeSelection';
=======
>>>>>>> d1d77d0 (dashboard and variants edits)

type TabType = 'general' | 'media' | 'attributes' | 'seo' | 'shipping';

export default function AdminProductEditPage({ params }: { params?: { id: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isEdit = !!params?.id;
    const productId = params?.id;
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
<<<<<<< HEAD
=======
    const [hasVariants, setHasVariants] = useState(false);
>>>>>>> d1d77d0 (dashboard and variants edits)

    // SEO
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    // Shipping & Physical
    const [weightKg, setWeightKg] = useState('');
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [sizeGuideId, setSizeGuideId] = useState('');

    // Tags & Attributes
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
<<<<<<< HEAD
=======
    
    // Media
    const [images, setImages] = useState<any[]>([]);

    // Stock (for non-configurable products)
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockStatus, setStockStatus] = useState('in_stock');
    const [lowStockThreshold, setLowStockThreshold] = useState('5');

    // Assigned Attributes (New Variant System)
    const [assignedAttributeIds, setAssignedAttributeIds] = useState<string[]>([]);

>>>>>>> d1d77d0 (dashboard and variants edits)
    // Validation & UX
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track dirty state on any input change
<<<<<<< HEAD
    const markDirty = useCallback(() => setIsDirty(true), []);

    // Media
    // Media
    const [images, setImagesState] = useState<any[]>([]);
    // Track dirty state on any input change
    const markDirty = useCallback(() => setIsDirty(true), []);

    const setImages = useCallback((newImages: any[]) => {
        setImagesState(newImages);
        markDirty();
    }, [markDirty]);

    const [productAttributes, setProductAttributesState] = useState<{ attribute_id: string, value_id: string, is_variation_maker: boolean }[]>([]);

    const setProductAttributes = useCallback((newAttrs: any[]) => {
        setProductAttributesState(newAttrs);
        markDirty();
    }, [markDirty]);
=======
    const markDirty = useCallback(() => { if (!isDirty) setIsDirty(true); }, [isDirty]);
>>>>>>> d1d77d0 (dashboard and variants edits)

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

<<<<<<< HEAD
=======
    // Track whether initial data population is in progress
    const [isPopulating, setIsPopulating] = useState(true);

>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
    const { data: allAttributes } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: () => api.getAdminAttributes(),
=======
    const { data: globalAttributes } = useQuery({
        queryKey: ['admin-global-attributes'],
        queryFn: () => api.getAttributes(),
>>>>>>> d1d77d0 (dashboard and variants edits)
    });

    const { data: sizeGuides } = useQuery({
        queryKey: ['admin-size-guides'],
        queryFn: () => api.getAdminSizeGuides(),
    });

<<<<<<< HEAD
    // Populate form
    useEffect(() => {
        if (isEdit && productData?.product) {
=======
    // Populate form (without triggering isDirty)
    useEffect(() => {
        if (isEdit && productData?.product) {
            setIsPopulating(true);
>>>>>>> d1d77d0 (dashboard and variants edits)
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
<<<<<<< HEAD
=======
            setHasVariants(p.has_variants || false);
>>>>>>> d1d77d0 (dashboard and variants edits)
            setMetaTitle(p.meta_title || '');
            setMetaDescription(p.meta_description || '');
            setWeightKg(p.weight_kg?.toString() || '');
            setSizeGuideId(p.size_guide_id || '');

            if (p.dimensions_cm) {
                setDimensions(p.dimensions_cm);
            }

<<<<<<< HEAD
=======
            setStockQuantity(p.stock_quantity?.toString() || '0');
            setStockStatus(p.stock_status || 'in_stock');
            setLowStockThreshold(p.low_stock_threshold?.toString() || '5');

>>>>>>> d1d77d0 (dashboard and variants edits)
            if (p.tags) {
                setSelectedTags(p.tags.map((t: any) => t.id));
            }

<<<<<<< HEAD
            if (p.attributes) {
                setProductAttributes(p.attributes.map((a: any) => ({
                    attribute_id: a.attribute_id,
                    value_id: a.value_id,
                    is_variation_maker: a.is_variation_maker
                })));
            }

=======
>>>>>>> d1d77d0 (dashboard and variants edits)
            if (p.images) {
                setImages(p.images.map((img: any) => ({
                    id: img.id,
                    image_url: img.url || img.image_url,
                    is_primary: img.is_primary,
                    sort_order: img.sort_order
                })));
            }
<<<<<<< HEAD
=======

            if (p.attributes) {
                setAssignedAttributeIds(p.attributes.map((a: any) => a.attribute_id));
            }

            // Mark population complete after a tick so state setters flush
            setTimeout(() => {
                setIsPopulating(false);
                setIsDirty(false);
            }, 0);
        } else if (!isEdit) {
            setIsPopulating(false);
>>>>>>> d1d77d0 (dashboard and variants edits)
        }
    }, [productData, isEdit]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            setFieldErrors({});
<<<<<<< HEAD
            const payload = {
=======
            const payload: any = {
>>>>>>> d1d77d0 (dashboard and variants edits)
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
<<<<<<< HEAD
=======
                has_variants: hasVariants,
>>>>>>> d1d77d0 (dashboard and variants edits)
                meta_title: metaTitle,
                meta_description: metaDescription,
                weight_kg: parseFloat(weightKg) || null,
                dimensions_cm: dimensions,
                size_guide_id: sizeGuideId || null,
                tags: selectedTags,
<<<<<<< HEAD
                attributes: productAttributes,
                images: images
            };

=======
                images: images,
                attributes: assignedAttributeIds,
            };

            // Include stock fields for simple products
            if (!hasVariants) {
                payload.stock_quantity = parseInt(stockQuantity) || 0;
                payload.stock_status = stockStatus;
                payload.low_stock_threshold = parseInt(lowStockThreshold) || 5;
            }

>>>>>>> d1d77d0 (dashboard and variants edits)
            if (isEdit) {
                return api.adminUpdateProduct(productId!, payload);
            } else {
                return api.adminCreateProduct(payload);
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
<<<<<<< HEAD
=======
        markDirty();
>>>>>>> d1d77d0 (dashboard and variants edits)
    };

    if (isEdit && isProductLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-orange" />
            <p className="font-medium animate-pulse">Loading product command center...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
<<<<<<< HEAD
            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-[var(--z-sticky)] bg-[#FAF9F6] bg-opacity-90 backdrop-blur-md pt-4 pb-4 mb-8 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
=======
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
>>>>>>> d1d77d0 (dashboard and variants edits)
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-neutral-900">{isEdit ? 'Refine Product' : 'Craft New Product'}</h1>
                        <p className="text-sm font-medium text-neutral-500">{isEdit ? `Modifying: ${name}` : 'Adding a new gem to the collection'}</p>
                    </div>
<<<<<<< HEAD
                </div>
                <div className="flex items-center gap-3">
=======
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
                            href={`/shop/products/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 border border-neutral-200 bg-white text-neutral-600 rounded-2xl font-bold text-sm hover:bg-neutral-50 transition-colors shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View in Store
                        </a>
                    )}
>>>>>>> d1d77d0 (dashboard and variants edits)
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending || !name || !price}
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
                    { id: 'media', label: 'Media Gallery', icon: ImageIcon },
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
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Product Name <span className="text-red-500">*</span></label>
                                        <input
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                                            placeholder="e.g. Velvet Tufted Armchair"
                                            className={`w-full px-5 py-3.5 rounded-2xl border ${fieldErrors.name ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 focus:border-red-400' : 'border-neutral-100 bg-neutral-50 focus:ring-primary-orange/5 focus:border-primary-orange/30'} focus:bg-white focus:ring-4 outline-none transition-all text-lg font-bold`}
                                        />
                                        {fieldErrors.name && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{fieldErrors.name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Short Punchy Description</label>
                                        <input
                                            value={shortDescription}
                                            onChange={(e) => setShortDescription(e.target.value)}
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
<<<<<<< HEAD
=======
                                    <div className="md:col-span-2 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900">Enable Variant Logic</p>
                                                <p className="text-xs text-blue-500">Enable this if you want to use unique prices/stock per variant combination.</p>
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
>>>>>>> d1d77d0 (dashboard and variants edits)
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

                    {/* --- TAB: MEDIA --- */}
                    {activeTab === 'media' && (
                        <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm">
                            <ProductGallery images={images} setImages={setImages} token={token || ''} />
                        </div>
                    )}

                    {/* --- TAB: ATTRIBUTES --- */}
                    {activeTab === 'attributes' && (
<<<<<<< HEAD
                        <div className="space-y-8">
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm">
                                <AttributeSelection
                                    availableAttributes={allAttributes || []}
                                    selectedAttributes={productAttributes}
                                    onChange={setProductAttributes}
                                />
                            </div>

                            {/* Variations Teaser */}
                            <div className="p-8 rounded-3xl bg-neutral-900 text-white overflow-hidden relative">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="max-w-md">
                                        <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                            <ListPlus className="w-6 h-6 text-primary-orange" />
                                            Variation Logic
                                        </h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                            Combinations of attributes marked "Creates Variation" will generate individual SKUs where you can track stock and adjust pricing.
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/products/${productId}/variations`}
                                        className="px-6 py-3 bg-white text-neutral-900 rounded-2xl font-black text-sm hover:bg-neutral-100 active:scale-95 transition-all shadow-xl"
                                    >
                                        Configure Variations
                                    </Link>
                                </div>
                                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-orange opacity-10 rounded-full blur-3xl pointer-events-none" />
=======
                        <div className="space-y-6">
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                            <Settings2 className="w-5 h-5 text-primary-orange" />
                                            Product Attributes Matrix
                                        </h2>
                                        <p className="text-xs text-neutral-400 mt-1">Select which global dimensions (e.g., Color, Size) define this product&apos;s variants.</p>
                                    </div>
                                    <Link
                                        href="/admin/attributes"
                                        className="text-xs font-bold text-primary-orange hover:underline flex items-center gap-1"
                                    >
                                        Global Pool <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                {/* Link to matrix if has variants */}
                                {hasVariants && isEdit && (
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
                                        <Link
                                            href={`/admin/products/${productId}/variants`}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                        >
                                            Open Generator
                                        </Link>
                                    </div>
                                )}

                                {/* Attribute Selection */}
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
                                    
                                    {(!globalAttributes || globalAttributes.length === 0) && (
                                        <div className="text-center py-16 border-4 border-dashed border-neutral-50 rounded-[2.5rem] bg-neutral-50/30">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100 text-neutral-200">
                                                <Plus className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">No dimensions in pool</p>
                                            <Link href="/admin/attributes" className="text-xs text-primary-orange font-black uppercase tracking-widest mt-4 inline-block hover:underline">Setup dimensions pool</Link>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-500"><Info className="w-4 h-4" /></div>
                                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                        <strong>Configuration Sync:</strong> Assignments directly control the Variant Matrix Generator. Removing a dimension will purge any variants built with it.
                                    </p>
                                </div>
>>>>>>> d1d77d0 (dashboard and variants edits)
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SEO --- */}
                    {activeTab === 'seo' && (
                        <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl"><Globe className="w-6 h-6 text-blue-500" /></div>
                                <div>
<<<<<<< HEAD
                                    <h2 className="text-xl font-black text-neutral-900">SEO & Discoverability</h2>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Optimizing for Google & Social</p>
                                </div>
                            </div>

                            <div className="space-y-5">
=======
                                    <h2 className="text-xl font-black text-neutral-900 font-inter">Global Presence</h2>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">SEO Meta & Discovery Handles</p>
                                </div>
                            </div>

                            <div className="space-y-6">
>>>>>>> d1d77d0 (dashboard and variants edits)
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Meta Title</label>
                                    <input
                                        value={metaTitle}
<<<<<<< HEAD
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder={name}
                                        className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-bold"
                                    />
                                    <p className="mt-2 text-[10px] font-medium text-neutral-400 px-1 italic">Preview: {metaTitle || name} | Premium Furniture Store</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Meta Description</label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Add a summary for search engines..."
=======
                                        onChange={(e) => { setMetaTitle(e.target.value); markDirty(); }}
                                        placeholder={name}
                                        className="w-full px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-bold"
                                    />
                                    <p className="mt-2 text-[10px] font-medium text-neutral-400 px-1 italic">Preview: {metaTitle || name} | Luxe Furniture Studio</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Search Snippet (Meta Decsription)</label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => { setMetaDescription(e.target.value); markDirty(); }}
                                        rows={4}
                                        placeholder="Summarize the product for search engine results..."
>>>>>>> d1d77d0 (dashboard and variants edits)
                                        className="w-full px-5 py-4 rounded-3xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-medium resize-none text-sm"
                                    />
                                </div>

                                <div>
<<<<<<< HEAD
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Custom Slug (URL Handle)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-400 bg-neutral-50 px-3 py-3 rounded-xl border border-neutral-100">/shop/</span>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="automatic-slug-generation"
                                            className="flex-1 px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-mono text-xs font-bold"
=======
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">URL Handle (Slug)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-neutral-400 bg-neutral-100 px-4 py-4 rounded-2xl border border-neutral-100">/shop/products/</div>
                                        <input
                                            value={slug}
                                            onChange={(e) => { setSlug(e.target.value); markDirty(); }}
                                            placeholder="automatic"
                                            className="flex-1 px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-mono text-xs font-bold"
>>>>>>> d1d77d0 (dashboard and variants edits)
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SHIPPING --- */}
                    {activeTab === 'shipping' && (
                        <div className="space-y-8">
<<<<<<< HEAD
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
                                            onChange={(e) => setWeightKg(e.target.value)}
                                            placeholder="0.0"
                                            className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Volume Pricing Class</label>
                                        <select className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none">
                                            <option>Standard Flat Rate</option>
                                            <option>Heavy / Fragile (Curbside)</option>
                                            <option>White Glove Delivery</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Length (cm)</label>
                                            <input
                                                value={dimensions.length}
                                                onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Width (cm)</label>
                                            <input
                                                value={dimensions.width}
                                                onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Height (cm)</label>
                                            <input
                                                value={dimensions.height}
                                                onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-center"
                                            />
=======
                            {/* Stock Management Section */}
                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary-orange" />
                                    Inventory Management
                                </h2>

                                {!hasVariants ? (
                                    /* Simple product: direct stock input */
                                    <div className="space-y-6 p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Main Single Stock</p>
                                                <p className="text-xs text-emerald-600/70 font-medium">Direct inventory control for non-variant products.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Available Units</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stockQuantity}
                                                    onChange={(e) => { setStockQuantity(e.target.value); markDirty(); }}
                                                    className="w-full px-6 py-4 rounded-2xl border border-neutral-100 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all font-black text-2xl text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Display Status</label>
                                                <select
                                                    value={stockStatus}
                                                    onChange={(e) => { setStockStatus(e.target.value); markDirty(); }}
                                                    className="w-full px-6 py-4 rounded-2xl border border-neutral-100 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
                                                >
                                                    <option value="in_stock">✅ Active Stock</option>
                                                    <option value="low_stock">⚠️ Low Reserve</option>
                                                    <option value="out_of_stock">❌ Stockout</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Alert Threshold</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={lowStockThreshold}
                                                    onChange={(e) => { setLowStockThreshold(e.target.value); markDirty(); }}
                                                    className="w-full px-6 py-4 rounded-2xl border border-neutral-100 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Configurable product: stock managed per variant combination */
                                    <div className="p-8 rounded-[2rem] bg-blue-50/50 border border-blue-100 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="flex-shrink-0 w-16 h-16 bg-blue-100/50 rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100">
                                                <Settings2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-blue-900 leading-tight">Decentralized Stock Logic</p>
                                                <p className="text-xs text-blue-500 mt-1 font-bold uppercase tracking-widest">Managed via Variant Matrix Generator</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 bg-white rounded-[1.5rem] border border-blue-100/50 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">
                                                <span>Active Matrix Dimensions</span>
                                                <span>{assignedAttributeIds.length} Layers</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {assignedAttributeIds.map(id => {
                                                    const attr = globalAttributes?.find((a: any) => a.id === id);
                                                    return (
                                                        <div key={id} className="px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-neutral-500 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                            {attr?.name || 'Dimension'}
                                                        </div>
                                                    );
                                                })}
                                                {assignedAttributeIds.length === 0 && (
                                                    <p className="text-xs text-amber-500 font-bold italic px-1">No dimensions selected. Please visit the Attributes tab.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center p-2">
                                            <Link 
                                                href={`/admin/products/${productId}/variants`}
                                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/10"
                                            >
                                                Enter Variant Control Matrix <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary-orange" />
                                    Physical Specifications
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Dead Weight (KG)</label>
                                        <input
                                            type="number"
                                            value={weightKg}
                                            onChange={(e) => { setWeightKg(e.target.value); markDirty(); }}
                                            placeholder="0.0"
                                            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Shipping Class</label>
                                        <select className="w-full px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none appearance-none">
                                            <option>Parcel (Small/Medium)</option>
                                            <option>LTL Freight (Curbside)</option>
                                            <option>White Glove Platinum</option>
                                            <option>Local Pickup Only</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Physical Dimensions (CM)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-400 mb-1.5 text-center uppercase">Length</p>
                                                <input
                                                    value={dimensions.length}
                                                    onChange={(e) => { setDimensions({ ...dimensions, length: e.target.value }); markDirty(); }}
                                                    className="w-full px-4 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-center focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-400 mb-1.5 text-center uppercase">Width</p>
                                                <input
                                                    value={dimensions.width}
                                                    onChange={(e) => { setDimensions({ ...dimensions, width: e.target.value }); markDirty(); }}
                                                    className="w-full px-4 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-center focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-400 mb-1.5 text-center uppercase">Height</p>
                                                <input
                                                    value={dimensions.height}
                                                    onChange={(e) => { setDimensions({ ...dimensions, height: e.target.value }); markDirty(); }}
                                                    className="w-full px-4 py-4 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-center focus:bg-white transition-all"
                                                />
                                            </div>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                        </div>
                                    </div>
                                </div>
                            </div>
<<<<<<< HEAD

                            <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm">
                                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-primary-orange" />
                                    Dimensional Support
                                </h3>
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 ml-1 mb-2">Attached Size Guide</label>
                                    <select
                                        value={sizeGuideId}
                                        onChange={(e) => setSizeGuideId(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 font-bold text-sm outline-none focus:ring-4 focus:ring-primary-orange/5"
                                    >
                                        <option value="">No Size Guide Attached</option>
                                        {sizeGuides?.map((guide: any) => (
                                            <option key={guide.id} value={guide.id}>{guide.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-neutral-400 px-1 italic">Size guides appear as a popup link on the product page for customers.</p>
                                </div>
                            </div>
=======
>>>>>>> d1d77d0 (dashboard and variants edits)
                        </div>
                    )}
                </div>

<<<<<<< HEAD
                {/* Sidebar (Pricing, Organization, Visibility) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Price & Stock Stats */}
                    <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6 group">
                        <div className="space-y-1.5 px-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400">Master Base Price</label>
                            <div className="relative group/price">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-black text-xl group-focus-within/price:text-primary-orange transition-colors">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => { setPrice(e.target.value); clearFieldError('base_price'); }}
                                    placeholder="0.00"
                                    className={`w-full pl-10 pr-6 py-4 rounded-2xl border ${fieldErrors.base_price ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10' : 'border-neutral-100 bg-neutral-50 focus:ring-primary-orange/5 focus:border-primary-orange/30'} focus:bg-white focus:ring-8 outline-none transition-all font-black text-3xl text-neutral-900`}
                                />
                            </div>
                            {fieldErrors.base_price && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.base_price}</p>}
                        </div>

                        <div className="space-y-1 px-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Master SKU</label>
                            <input
                                value={sku}
                                onChange={(e) => { setSku(e.target.value); clearFieldError('sku'); }}
                                placeholder="FUR-001"
                                className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.sku ? 'border-red-300 bg-red-50/30' : 'border-neutral-100 bg-neutral-50'} focus:bg-white outline-none transition-all font-mono uppercase text-sm font-bold tracking-widest`}
                            />
                            {fieldErrors.sku && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.sku}</p>}
                        </div>

                        <hr className="border-neutral-50" />

                        <div className="space-y-4">
                            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Category Assignment</label>
                            <select
                                value={categoryId}
                                onChange={(e) => { setCategoryId(e.target.value); clearFieldError('category_id'); }}
                                className={`w-full px-5 py-3.5 rounded-2xl border ${fieldErrors.category_id ? 'border-red-300 bg-red-50/30' : 'border-neutral-100 bg-neutral-50'} font-black text-sm outline-none focus:ring-4 focus:ring-primary-orange/5 transition-all text-neutral-700`}
                            >
                                <option value="">Select Category...</option>
=======
                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Status & Visibility Card */}
                    <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Store Visibility</h3>
                        
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                                    <span className="text-sm font-bold text-neutral-700">Live on Storefront</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => { setIsActive(e.target.checked); markDirty(); }}
                                    className="w-5 h-5 text-primary-orange rounded-lg border-neutral-300 focus:ring-primary-orange"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-neutral-200 text-neutral-400'}`}>
                                        <Plus className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700">Feature in Spotlight</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => { setIsFeatured(e.target.checked); markDirty(); }}
                                    className="w-5 h-5 text-primary-orange rounded-lg border-neutral-300 focus:ring-primary-orange"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${isNew ? 'bg-blue-100 text-blue-600' : 'bg-neutral-200 text-neutral-400'}`}>
                                        <Plus className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700">Badge as "New Arrival"</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isNew}
                                    onChange={(e) => { setIsNew(e.target.checked); markDirty(); }}
                                    className="w-5 h-5 text-primary-orange rounded-lg border-neutral-300 focus:ring-primary-orange"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Pricing & Category Card */}
                    <div className="p-8 rounded-[2.5rem] bg-neutral-900 text-white shadow-2xl space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">Financial Control</h3>
                                {hasVariants && (
                                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">
                                        Active Fallback
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-neutral-600">$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => { setPrice(e.target.value); clearFieldError('base_price'); }}
                                    className={`w-full pl-12 pr-6 py-8 bg-neutral-800/50 border rounded-3xl text-4xl font-black focus:ring-4 focus:ring-primary-orange/20 focus:border-primary-orange/50 outline-none transition-all placeholder:text-neutral-700 ${hasVariants ? 'border-amber-500/30 text-neutral-300' : 'border-neutral-800 text-white'}`}
                                    placeholder="0.00"
                                />
                                <div className="flex items-center justify-between mt-4 ml-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Base Catalog Price</p>
                                    {hasVariants && (
                                        <p className="text-[9px] font-bold text-amber-500/60 lowercase italic">Used when variants have no price</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">Classification</h3>
                            <select
                                value={categoryId}
                                onChange={(e) => { setCategoryId(e.target.value); markDirty(); }}
                                className="w-full px-6 py-4 bg-neutral-800/50 border border-neutral-800 rounded-2xl text-sm font-bold text-white outline-none focus:ring-4 focus:ring-primary-orange/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Draft (No Category)</option>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                {categories?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
<<<<<<< HEAD
                            {fieldErrors.category_id && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.category_id}</p>}
                        </div>
                    </div>

                    {/* Visibility & Status */}
                    <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Visibility Controls</h3>

                        <div className="space-y-5">
                            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-50 bg-neutral-50/50 hover:bg-white hover:border-emerald-100 hover:shadow-md transition-all cursor-pointer group">
                                <span className="text-sm font-black text-neutral-600 group-hover:text-emerald-600 transition-colors">Active for Sale</span>
                                <div className="relative">
                                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only" />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-neutral-200'}`} />
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-50 bg-neutral-50/50 hover:bg-white hover:border-amber-100 hover:shadow-md transition-all cursor-pointer group">
                                <span className="text-sm font-black text-neutral-600 group-hover:text-amber-600 transition-colors">Featured Hero</span>
                                <div className="relative">
                                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="sr-only" />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${isFeatured ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-neutral-200'}`} />
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-50 bg-neutral-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group">
                                <span className="text-sm font-black text-neutral-600 group-hover:text-blue-600 transition-colors">Mark as New</span>
                                <div className="relative">
                                    <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="sr-only" />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${isNew ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-neutral-200'}`} />
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isNew ? 'translate-x-5' : ''}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Shortcuts / Actions */}
                    <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-white border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-400 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" /> Archive Product
                        </button>
                        <p className="text-[10px] text-center text-neutral-400 font-medium">Last modified {productData?.product?.updated_at ? new Date(productData.product.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
=======
                        </div>

                        <div className="pt-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3 ml-1">Global SKU ID</label>
                            <input
                                value={sku}
                                onChange={(e) => { setSku(e.target.value); markDirty(); }}
                                placeholder="FURN-XXXXX"
                                className="w-full px-6 py-4 bg-neutral-800/50 border border-neutral-800 rounded-2xl text-sm font-mono font-bold text-primary-orange focus:ring-4 focus:ring-primary-orange/20 outline-none transition-all placeholder:text-neutral-700 uppercase"
                            />
                        </div>
                    </div>

                    {/* Data Guard Card */}
                    {isDirty && (
                        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><AlertTriangle className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-sm font-black text-amber-900 tracking-tight">Pending Refinements</p>
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">You have made adjustments that haven't been pushed to the live database yet.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending}
                                className="w-full py-4 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                            >
                                {saveMutation.isPending ? 'Syncing...' : 'Push Adjustments'}
                            </button>
                        </div>
                    )}
>>>>>>> d1d77d0 (dashboard and variants edits)
                </div>
            </div>
        </div>
    );
}
