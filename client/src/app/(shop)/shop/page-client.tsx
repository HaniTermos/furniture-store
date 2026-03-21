'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Check } from 'lucide-react';

import ProductCard from '@/components/product/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import { useQuery } from '@tanstack/react-query';
import { categories } from '@/lib/data';
import { api } from '@/lib/api';

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
    { label: 'Most Popular', value: 'popular' },
];

interface AttributeFilter {
    name: string;
    type: string;
    values: Array<{ value: string; image_url: string | null }>;
}


export default function ShopPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});


    const { data, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.getProducts()
    });

    const { data: filtersData } = useQuery({
        queryKey: ['product-filters'],
        queryFn: () => api.getProductFilters()
    });

    const products = data?.products || [];
    const attributeFilters: AttributeFilter[] = filtersData?.filters || [];

    const toggleAttributeValue = (attrName: string, value: string) => {
        setSelectedAttributes(prev => {
            const current = prev[attrName] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [attrName]: updated };
        });
    };

    const clearAttributeFilter = (attrName: string) => {
        setSelectedAttributes(prev => {
            const updated = { ...prev };
            delete updated[attrName];
            return updated;
        });
    };


    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter((p) => p.categorySlug === selectedCategory);
        }

        // Attribute filters
        Object.entries(selectedAttributes).forEach(([attrName, selectedValues]) => {
            if (selectedValues.length > 0) {
                filtered = filtered.filter((p: any) => {
                    const productAttrs = p.configuration_options || [];
                    const matchingOption = productAttrs.find((opt: any) => opt.name === attrName);
                    if (!matchingOption) return false;
                    const optionValues = matchingOption.values?.map((v: any) => v.value) || [];
                    return selectedValues.some(v => optionValues.includes(v));
                });
            }
        });


        // Sort
        switch (sortBy) {
            case 'price_asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                filtered.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return filtered;
    }, [products, searchQuery, selectedCategory, sortBy, selectedAttributes]);

    const hasActiveFilters = selectedCategory || Object.values(selectedAttributes).some(v => v.length > 0);


    return (
        <>
            {/* Hero */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide section-padding text-center">
                    <Reveal>
                        <span className="text-primary-orange text-sm font-medium uppercase tracking-wider">
                            Our Collection
                        </span>
                        <h1 className="text-display-md md:text-display-lg font-bold text-white mt-3 mb-4">
                            Shop All Furniture
                        </h1>
                        <p className="text-white/50 text-lg max-w-lg mx-auto">
                            Browse our curated selection of premium, modern furniture pieces.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Toolbar */}
            <section className="sticky top-16 md:top-20 z-30 bg-white border-b border-neutral-100 shadow-sm">
                <div className="container-wide section-padding">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 py-4">
                        {/* Search */}
                        <div className="relative w-full sm:flex-1 sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-100 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-neutral-50 focus:ring-2 focus:ring-primary-orange/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-neutral-400" />
                                </button>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${showFilters
                                    ? 'bg-primary-black text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden md:inline">Filters</span>
                            </button>

                            {/* Sort Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-200 transition-all">
                                    <span className="hidden md:inline">Sort:</span>
                                    {sortOptions.find((s) => s.value === sortBy)?.label}
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSortBy(option.value)}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.value
                                                ? 'text-primary-orange font-medium'
                                                : 'text-neutral-600 hover:bg-neutral-50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div className="hidden md:flex bg-neutral-100 rounded-full p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Results count */}
                            <span className="text-sm text-neutral-400 hidden md:inline">
                                {filteredProducts.length} products
                            </span>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pb-4 space-y-4">
                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 py-2">Categories:</span>
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory

                                                ? 'bg-primary-black text-white'
                                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                }`}
                                        >
                                            All
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        selectedCategory === cat.slug ? null : cat.slug
                                                    )
                                                }
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug
                                                    ? 'bg-primary-black text-white'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Dynamic Attribute Filters */}
                                    {attributeFilters.map((attr) => (
                                        <div key={attr.name} className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 py-2">{attr.name}:</span>
                                            <button
                                                onClick={() => clearAttributeFilter(attr.name)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedAttributes[attr.name]?.length
                                                    ? 'bg-primary-orange text-white'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                Any
                                            </button>
                                            {attr.values.map((val) => {
                                                const isSelected = selectedAttributes[attr.name]?.includes(val.value);
                                                if (attr.type === 'color') {
                                                    const [, hex] = val.value.split('|');
                                                    return (
                                                        <button
                                                            key={val.value}
                                                            onClick={() => toggleAttributeValue(attr.name, val.value)}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-primary-orange ring-2 ring-primary-orange/30' : 'border-transparent'}`}
                                                            style={{ backgroundColor: hex || '#ccc' }}
                                                            title={val.value.split('|')[0]}
                                                        >
                                                            {isSelected && <Check className="w-4 h-4 text-white mx-auto" />}
                                                        </button>
                                                    );
                                                }
                                                if (attr.type === 'image' && val.image_url) {
                                                    return (
                                                        <button
                                                            key={val.value}
                                                            onClick={() => toggleAttributeValue(attr.name, val.value)}
                                                            className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all ${isSelected ? 'border-primary-orange ring-2 ring-primary-orange/30' : 'border-transparent'}`}
                                                            title={val.value}
                                                        >
                                                            <img src={val.image_url} alt={val.value} className="w-full h-full object-cover" />
                                                        </button>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={val.value}
                                                        onClick={() => toggleAttributeValue(attr.name, val.value)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                                                            ? 'bg-primary-orange text-white'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                            }`}
                                                    >
                                                        {val.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {/* Clear all filters */}
                                    {hasActiveFilters && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory(null);
                                                    setSelectedAttributes({});
                                                }}
                                                className="text-xs text-red-500 hover:text-red-600 font-medium underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Product Grid */}
            <section className="py-12 md:py-16">
                <div className="container-wide section-padding">
                    {isLoading ? (
                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
                                    : 'grid grid-cols-1 md:grid-cols-2 gap-6'
                            }
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Search className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-neutral-400">
                                Try adjusting your search or filter criteria.
                            </p>
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
                                    : 'grid grid-cols-1 md:grid-cols-2 gap-6'
                            }
                        >
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
