'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Reveal, StaggerContainer, StaggerChild, CountUp } from '@/components/motion/Reveal';
import ProductCard from '@/components/product/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { categories } from '@/lib/data';
import { api } from '@/lib/api';

const stats = [
    { value: 15, suffix: 'K+', label: 'Loyal Customers' },
    { value: 10, suffix: '+', label: 'Years Journey' },
    { value: 150, suffix: '+', label: 'Collections Served' },
];

export default function HomePage() {
    const { data, isLoading } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: () => api.getFeaturedProducts(4)
    });

    const featuredProducts = data?.products || [];

    return (
        <>
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex items-center bg-primary-black overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-primary-black to-neutral-800" />

                {/* Decorative Large Typography */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
                    <motion.h2
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.06 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="text-[20vw] font-bold text-white leading-none tracking-tighter whitespace-nowrap"
                    >
                        harmony
                    </motion.h2>
                </div>

                {/* Hero Content */}
                <div className="relative container-wide section-padding py-32 md:py-0 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen pt-20">
                        {/* Left Column */}
                        <div className="space-y-8 z-10">
                            {/* Product Thumbnails */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${i === 1 ? 'border-primary-orange' : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                                            <span className="text-white/40 text-[10px] font-medium">0{i}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-white/60 text-sm md:text-base max-w-md leading-relaxed"
                            >
                                Your journey to a calm, beautifully organized, and perfectly nested home begins here.
                            </motion.p>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <Link href="/shop" className="btn-primary text-sm">
                                    Get Your Furniture Now
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex gap-8 md:gap-12 pt-4"
                            >
                                {stats.map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="text-3xl md:text-4xl font-bold text-white">
                                            <CountUp end={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <p className="text-white/40 text-xs md:text-sm mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Column - Chair Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
                            className="relative flex items-center justify-center"
                        >
                            <div className="relative w-full max-w-lg aspect-square">
                                {/* Orange glow behind chair */}
                                <div className="absolute inset-0 bg-primary-orange/20 rounded-full blur-[100px] scale-75" />
                                <Image
                                    src="/images/products/chair-orange-1.png"
                                    alt="Luna Liven Lounge Chair"
                                    fill
                                    className="object-contain z-10 drop-shadow-2xl"
                                    priority
                                />
                            </div>

                            {/* Category tags below image */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-between px-8 z-10">
                                {['Serene', 'Cozy', 'Effortless'].map((tag) => (
                                    <span key={tag} className="text-white/40 text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <ChevronDown className="w-6 h-6 text-white/40" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ===== DESIGN PHILOSOPHY SECTION ===== */}
            <section className="py-24 md:py-32 bg-neutral-50">
                <div className="container-wide section-padding">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <Reveal>
                            <h2 className="text-display-md md:text-display-lg font-bold text-neutral-900 leading-tight">
                                Thoughtfully
                                <br />
                                Designed
                                <br />
                                Pieces
                            </h2>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="space-y-6">
                                <p className="text-neutral-600 text-lg leading-relaxed">
                                    Explore our curated range of clean, modern, and timeless furniture. Each piece is
                                    crafted to bring calm and style to your everyday living.
                                </p>
                                <Link href="/shop" className="btn-outline">
                                    View All Products
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ===== FEATURED CATEGORIES ===== */}
            <section className="py-24 md:py-32">
                <div className="container-wide section-padding">
                    <Reveal>
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-primary-orange text-sm font-medium uppercase tracking-wider">
                                    Categories
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                                    Browse by Category
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-orange transition-colors"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {categories.map((cat) => (
                            <StaggerChild key={cat.id}>
                                <Link href={`/shop?category=${cat.slug}`} className="group block">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                                            <span className="text-neutral-400 text-sm">{cat.name}</span>
                                        </div>
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                                            <p className="text-white/60 text-sm">{cat.productCount} items</p>
                                        </div>
                                    </div>
                                </Link>
                            </StaggerChild>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container-wide section-padding">
                    <Reveal>
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-primary-orange text-sm font-medium uppercase tracking-wider">
                                    Bestsellers
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                                    Featured Collection
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-orange transition-colors"
                            >
                                Shop All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-2xl" />
                            ))
                        ) : (
                            featuredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ===== CTA BANNER ===== */}
            <section className="py-24 md:py-32 bg-primary-black relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-orange/10 rounded-full blur-[150px]" />
                </div>
                <div className="container-wide section-padding relative z-10">
                    <Reveal>
                        <div className="text-center max-w-2xl mx-auto">
                            <h2 className="text-display-md md:text-display-lg font-bold text-white mb-6">
                                Your everyday centerpiece.
                                <br />
                                <span className="text-primary-orange">Functional design.</span>
                            </h2>
                            <p className="text-white/50 text-lg mb-8">
                                Transform your space with furniture that doesn&apos;t just fill a room — it defines
                                it.
                            </p>
                            <Link href="/shop" className="btn-primary text-base px-8 py-4">
                                Explore the Collection
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
