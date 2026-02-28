'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Minus,
    Plus,
    ArrowRight,
    ChevronRight,
    RotateCcw,
    Heart,
    Share2,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/store/cart';
import { Reveal } from '@/components/motion/Reveal';
import ProductCard from '@/components/product/ProductCard';

// Feature icons as simple SVGs
function FeatureIcon({ type }: { type: string }) {
    const icons: Record<string, React.ReactNode> = {
        curves: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9" strokeLinecap="round" />
                <path d="M12 3c-4.97 0-9 4.03-9 9" strokeLinecap="round" strokeDasharray="4 4" />
            </svg>
        ),
        compact: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M4 12h16M12 4v16" />
            </svg>
        ),
        breathable: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
            </svg>
        ),
        sustainable: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <path d="M12 22V8" strokeLinecap="round" />
                <path d="M5 12s0-7 7-7 7 7 7 7" strokeLinecap="round" />
            </svg>
        ),
    };
    return <>{icons[type] || icons.curves}</>;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { data, isLoading } = useQuery({
        queryKey: ['product', params.slug],
        queryFn: () => api.getProductBySlug(params.slug)
    });

    const product = data?.product;
    const relatedProducts = data?.relatedProducts || [];

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeFeature, setActiveFeature] = useState(0);
    const { formatPrice } = useCurrency();
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);

    if (isLoading) {
        return (
            <div className="min-h-screen py-32 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen py-32 flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <Link href="/shop" className="btn-primary">Return to Shop</Link>
            </div>
        );
    }

    const selectedColor = product.colors.find(c => c.id === selectedColorId) || product.colors[0];
    const selectedSize = product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];

    const currentImage = selectedColor?.image || product.images[selectedImageIndex]?.url;
    const finalPrice = product.price + (selectedSize?.priceAdjustment || 0);

    const handleAddToCart = () => {
        if (quantity > 0) {
            addItem(product, quantity, selectedColor, selectedSize);
            openCart();
        }
    };

    return (
        <>
            {/* Navigation spacer */}
            <div className="h-20" />

            <section className="py-8 md:py-12">
                <div className="container-wide section-padding">
                    {/* Breadcrumb */}
                    <Reveal>
                        <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
                            <Link href="/" className="hover:text-neutral-600 transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <Link href="/shop" className="hover:text-neutral-600 transition-colors">
                                Shop
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <Link
                                href={`/shop?category=${product.categorySlug}`}
                                className="hover:text-neutral-600 transition-colors"
                            >
                                {product.category}
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-neutral-900 font-medium">{product.name}</span>
                        </nav>
                    </Reveal>

                    {/* Product Grid */}
                    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16">
                        {/* LEFT: Images */}
                        <Reveal direction="left" className="space-y-6">
                            {/* Product Name (mobile + desktop left) */}
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-display-md md:text-display-lg font-bold text-neutral-900 leading-tight"
                                >
                                    {product.name}
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-2 text-neutral-400 text-sm"
                                >
                                    {product.available}/{product.totalStock}{' '}
                                    <span className="text-primary-orange font-medium">Available</span>
                                </motion.div>
                            </div>

                            {/* Main Image */}
                            <div className="relative aspect-square bg-neutral-50 rounded-3xl overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative w-full h-full"
                                    >
                                        <Image
                                            src={currentImage || '/images/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-8"
                                            priority
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* 360° rotation text */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-neutral-400 text-sm">
                                    <RotateCcw className="w-4 h-4" />
                                    <span>You can rotate it 360°</span>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImageIndex === idx
                                            ? 'border-primary-orange'
                                            : 'border-transparent hover:border-neutral-200'
                                            }`}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={img.alt}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Color Swatches */}
                            <div className="flex gap-3">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColorId(color.id)}
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition-all ${selectedColor?.id === color.id
                                            ? 'ring-2 ring-offset-2 ring-primary-orange scale-110'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                        aria-label={`Select ${color.name}`}
                                    />
                                ))}
                            </div>
                        </Reveal>

                        {/* RIGHT: Details */}
                        <Reveal direction="right" delay={0.2} className="space-y-8">
                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Description</h3>
                                <p className="text-neutral-500 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {product.features.map((feature, idx) => (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setActiveFeature(idx)}
                                        whileTap={{ scale: 0.98 }}
                                        className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeFeature === idx
                                            ? 'bg-primary-orange text-white border-primary-orange'
                                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                                            }`}
                                    >
                                        <div className={`mb-3 ${activeFeature === idx ? 'text-white' : 'text-neutral-400'}`}>
                                            <FeatureIcon type={feature.icon} />
                                        </div>
                                        <p
                                            className={`text-sm leading-snug ${activeFeature === idx ? 'text-white/90' : 'text-neutral-600'
                                                }`}
                                        >
                                            {feature.description}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Product Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Product Details</h3>
                                <div className="space-y-3">
                                    {Object.entries(product.details).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between py-2.5 border-b border-neutral-100 last:border-0"
                                        >
                                            <span className="text-neutral-400 text-sm capitalize">{key}</span>
                                            <span className="text-neutral-900 text-sm font-medium text-right max-w-[60%]">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            {product.sizes.length > 1 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Size</h4>
                                    <div className="flex gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSizeId(size.id)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedSize?.id === size.id
                                                    ? 'bg-primary-black text-white'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {size.label}
                                                {size.priceAdjustment > 0 && ` (+$${size.priceAdjustment})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4">
                                <button
                                    className="p-3 rounded-full border border-neutral-200 hover:bg-neutral-100 transition-colors"
                                    aria-label="Add to wishlist"
                                    onClick={() => alert('Added to wishlist!')}
                                >
                                    <Heart className="w-5 h-5 text-neutral-600" />
                                </button>
                                <button
                                    className="p-3 rounded-full border border-neutral-200 hover:bg-neutral-100 transition-colors"
                                    aria-label="Share"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}
                                >
                                    <Share2 className="w-5 h-5 text-neutral-600" />
                                </button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ===== STICKY BOTTOM BAR ===== */}
            <div className="sticky bottom-0 z-40">
                <div className="bg-primary-black text-white">
                    <div className="container-wide section-padding py-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Tagline */}
                            <div className="hidden md:block">
                                <p className="text-lg font-semibold">Your everyday centerpiece.</p>
                                <p className="text-white/50 text-sm">Functional design.</p>
                            </div>

                            {/* Quantity + Price + CTA */}
                            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                {/* Quantity */}
                                <div className="flex items-center border border-white/20 rounded-full">
                                    <button
                                        onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-3">
                                    {product.originalPrice && (
                                        <span className="text-white/40 line-through text-lg">
                                            {formatPrice(product.originalPrice).display}
                                        </span>
                                    )}
                                    <span className="text-2xl font-bold">{formatPrice(finalPrice).display}</span>
                                </div>

                                {/* Add to Cart */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className="btn-primary flex-1 md:flex-initial justify-center"
                                    disabled={quantity === 0}
                                >
                                    Add to cart
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== RELATED PRODUCTS ===== */}
            <section className="py-24 bg-neutral-50">
                <div className="container-wide section-padding">
                    <Reveal>
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-10">
                            You might also like
                        </h2>
                    </Reveal>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
