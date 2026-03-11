'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Minus,
    Plus,
    ArrowRight,
    ChevronRight,
    Heart,
    Share2,
    Check
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/store/cart';
import { Reveal } from '@/components/motion/Reveal';
import ProductCard from '@/components/product/ProductCard';
import ReviewSection from '@/components/product/ReviewSection';



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
    const { formatPrice } = useCurrency();
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);

    // 360 Rotation State
    const [isRotating, setIsRotating] = useState(false);
    const [rotation, setRotation] = useState(0);
    const imageRef = useRef<HTMLDivElement>(null);

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
                <h1 className="text-3xl font-bold mb-4 text-neutral-900 font-['DM_Serif_Display']">Product Not Found</h1>
                <Link href="/shop" className="btn-primary">Return to Shop</Link>
            </div>
        );
    }

    const selectedColor = product.colors.find(c => c.id === selectedColorId) || product.colors[0];
    const selectedSize = product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];

    // Images logic
    const allImages = [...(product.images || [])];
    const currentImage = selectedColor?.image || allImages[selectedImageIndex]?.url;
    const finalPrice = product.price + (selectedSize?.priceAdjustment || 0);

    // Handle 360 rotation
    const handleMouseDown = () => setIsRotating(true);
    const handleMouseUp = () => setIsRotating(false);
    const handleMouseLeave = () => setIsRotating(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isRotating && imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const deltaX = e.clientX - centerX;
            setRotation(prev => prev + deltaX * 0.1);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isRotating && imageRef.current && e.touches.length > 0) {
            // Prevent default scrolling when rotating
            const rect = imageRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const deltaX = e.touches[0].clientX - centerX;
            setRotation(prev => prev + deltaX * 0.1);
        }
    };

    const handleAddToCart = () => {
        if (quantity > 0) {
            addItem(product, quantity, selectedColor, selectedSize);
            openCart();
        }
    };

    return (
        <main className="min-h-screen bg-[#F9F8F3]">
            {/* Header Spacer - Dark to make navbar text visible */}
            <div className="h-20 bg-primary-black w-full" />

            {/* Main Product Section */}
            <section className="pt-8 md:pt-12 pb-32 px-4 sm:px-6 lg:px-12 max-w-[1900px] mx-auto">
                {/* Breadcrumb - Minimal */}
                <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-8 md:mb-16 flex-wrap">
                    <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/shop" className="hover:text-neutral-900 transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-neutral-900 font-bold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-stretch">

                    {/* COLUMN 1: Title, Gallery & Swatches (3 spans) */}
                    <div className="lg:col-span-3 flex flex-col pt-4 lg:pt-12">
                        <Reveal className="flex flex-col h-full">
                            <div className="flex flex-col h-full">
                                <div className="mb-16">
                                    <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-light tracking-tight text-neutral-900 leading-[0.9]">
                                        {product.name.split(' ').slice(0, 2).join(' ')}<br />
                                        <span className="font-normal">{product.name.split(' ').slice(2).join(' ')}</span>
                                    </h1>
                                    <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-light text-neutral-300 italic">{product.available || '13'}/100</span>
                                            <span className="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-bold">Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-200 transition-all"
                                                aria-label="Add to wishlist"
                                            >
                                                <Heart className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (navigator.share) {
                                                        navigator.share({ title: product.name, url: window.location.href });
                                                    } else {
                                                        navigator.clipboard.writeText(window.location.href);
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:border-neutral-400 transition-all"
                                                aria-label="Share product"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery - 2-Column Grid */}
                                {allImages.length > 0 && (
                                    <div className="mb-16">
                                        <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-4 max-w-none sm:max-w-[280px]">
                                            {allImages.slice(0, 6).map((img, idx) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`relative aspect-square w-full rounded-lg overflow-hidden transition-all duration-500 bg-white/50 border ${selectedImageIndex === idx
                                                        ? 'border-neutral-900 ring-4 ring-neutral-900/5 scale-[1.02]'
                                                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-neutral-200'
                                                        }`}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={img.alt || product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Swatches - Advanced (Image/RGB) */}
                                <div className="mt-auto pb-12">
                                    <div className="flex gap-5 flex-wrap">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => setSelectedColorId(color.id)}
                                                className={`w-14 h-14 rounded-full transition-all duration-500 flex items-center justify-center border-2 overflow-hidden ${selectedColor?.id === color.id
                                                    ? 'border-neutral-900 shadow-xl'
                                                    : 'border-transparent hover:scale-110 opacity-90'
                                                    }`}
                                                style={{ backgroundColor: color.image ? 'transparent' : color.hex }}
                                                aria-label={color.name}
                                            >
                                                {color.image && (
                                                    <div className="relative w-full h-full">
                                                        <Image src={color.image} alt={color.name} fill className="object-cover" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* COLUMN 2: 360 Viewer (6 spans for more space) */}
                    <div className="lg:col-span-6 flex flex-col justify-center items-center">
                        <Reveal delay={0.2} className="w-full flex justify-center">
                            {/* 360 Container */}
                            <div
                                ref={imageRef}
                                className="relative w-full aspect-[4/5] max-w-[850px] cursor-grab active:cursor-grabbing group flex items-center justify-center"
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                                onMouseMove={handleMouseMove}
                                onTouchStart={handleMouseDown}
                                onTouchEnd={handleMouseUp}
                                onTouchMove={handleTouchMove}
                            >
                                {/* 360 Path Visualizer (Subtle Circle) */}
                                <div className="absolute w-[80%] aspect-square border border-neutral-900/[0.03] rounded-full pointer-events-none translate-y-1/4" />

                                {/* Main Image - MAX SCALE */}
                                <div
                                    className="w-full h-full flex items-center justify-center relative z-10"
                                    style={{
                                        transform: `rotateX(5deg) rotateY(${rotation}deg)`,
                                        transition: isRotating ? 'none' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                    }}
                                >
                                    <div className="relative w-[90%] h-[90%]">
                                        <Image
                                            src={currentImage || '/images/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                            priority
                                            draggable={false}
                                        />
                                    </div>
                                </div>

                                {/* Instruction */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold">You can rotate it</span>
                                    <span className="text-[12px] text-neutral-300 font-light italic">360°</span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* COLUMN 3: Details & Specs (3 spans) */}
                    <div className="lg:col-span-3 flex flex-col pt-12">
                        <Reveal delay={0.4} className="flex flex-col h-full">
                            <div className="flex flex-col h-full pl-8 border-l border-neutral-900/[0.05]">
                                {/* Description */}
                                <div className="mb-12">
                                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-neutral-900 mb-6">
                                        Description
                                    </h2>
                                    <p className="text-neutral-500 leading-relaxed text-sm font-light">
                                        {product.description || "A beautiful piece for your home, designed with both comfort and aesthetics in mind. Premium materials and expert craftsmanship ensures longevity."}
                                    </p>
                                </div>

                                {/* Product Detail - Simple List */}
                                <div className="flex-1">
                                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-neutral-900 mb-8">
                                        Product Detail
                                    </h2>

                                    <div className="space-y-4">
                                        {Object.entries(product.details).map(([key, value]) => (
                                            <div key={key} className="flex items-start justify-between border-b border-neutral-900/[0.05] pb-3 last:border-0">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pt-0.5">{key}</span>
                                                <span className="text-[11px] text-neutral-600 font-light text-right max-w-[180px] leading-tight">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* STICKY BOTTOM BAR - BLACK */}
            <div className="sticky bottom-0 z-40">
                <div className="bg-black text-white py-4 md:py-6">
                    <div className="container-wide px-4 sm:px-6 lg:px-12">
                        <div className="flex items-center justify-between gap-4 md:gap-12">

                            {/* Left: Tagline */}
                            <div className="hidden lg:block flex-shrink-0">
                                <p className="text-lg font-light tracking-tight leading-snug">
                                    Your everyday centerpiece.<br />
                                    <span className="text-white/40 italic">Functional design.</span>
                                </p>
                            </div>

                            {/* Center: Quantity Stepper */}
                            <div className="flex items-center bg-white border border-white/10 rounded-full p-1 sm:p-1.5 shadow-xl">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <span className="w-8 sm:w-12 text-center font-bold text-neutral-900 text-base sm:text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            </div>

                            {/* Right: Pricing & CTA */}
                            <div className="flex items-center gap-4 md:gap-12">
                                <div className="flex items-baseline gap-2 md:gap-4">
                                    {product.originalPrice && (
                                        <span className="text-neutral-500 line-through text-lg md:text-2xl font-light hidden sm:inline">
                                            {formatPrice(product.originalPrice).display}
                                        </span>
                                    )}
                                    <span className="text-base md:text-4xl font-light tracking-tighter">
                                        {formatPrice(finalPrice * quantity).display}
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ x: 5 }}
                                    onClick={handleAddToCart}
                                    className="flex items-center gap-2 md:gap-4 text-sm md:text-xl font-light tracking-tight hover:text-white/70 transition-colors border-l border-white/10 pl-4 md:pl-12 h-12 md:h-16"
                                >
                                    <span className="hidden sm:inline">Add to cart</span>
                                    <span className="sm:hidden">Add</span>
                                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 stroke-[1px]" />
                                </motion.button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <ReviewSection productId={product.id} />

            {/* RECOMMENDED PRODUCTS SECTION */}
            <section className="py-16 md:py-32 bg-neutral-50 relative overflow-hidden">
                <div className="container-wide section-padding">
                    <Reveal>
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 md:mb-16">
                            <div>
                                <h2 className="text-display-sm md:text-display-md font-['DM_Serif_Display'] text-neutral-900">
                                    You might also like
                                </h2>
                                <p className="text-neutral-400 mt-2 tracking-widest uppercase text-[10px] font-bold">Curated selection for you</p>
                            </div>
                            <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-primary-orange transition-colors pb-2">
                                View Collection
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.slice(0, 4).map((rp, idx) => (
                            <ProductCard key={rp.id} product={rp} index={idx} />
                        ))}
                    </div>
                </div>

                {/* Aesthetic background text */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-[0.02] select-none">
                    <span className="text-[30vw] font-bold whitespace-nowrap leading-none uppercase italic">Exclusive</span>
                </div>
            </section>
        </main >
    );
}
