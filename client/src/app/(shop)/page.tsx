'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Play, Volume2, VolumeX } from 'lucide-react';
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

const heroWords = ['Harmony', 'Comfort', 'Style'];

export default function HomePage() {
    const { data, isLoading } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: () => api.getFeaturedProducts(4)
    });

    const featuredProducts = data?.products || [];
    const [currentWord, setCurrentWord] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const heroRef = useRef<HTMLElement>(null);

    // Parallax on scroll
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });
    const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

    // Mouse parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % heroWords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 30);
        mouseY.set(y * 30);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <>
            {/* ===== HERO SECTION ===== */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center bg-primary-black overflow-hidden"
                onMouseMove={handleMouseMove}
            >
                {/* Background Video — BRIGHTER */}
                <motion.div className="absolute inset-0 z-0" style={{ y: videoY }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-110"
                        style={{ filter: 'brightness(0.7) contrast(1.05) saturate(1.3)' }}
                    >
                        <source src="/videos/hero-bg.mp4" type="video/mp4" />
                    </video>
                    {/* Subtle gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                </motion.div>

                {/* Animated Floating Particles */}
                <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${15 + (i % 4) * 20}%`,
                                width: i % 3 === 0 ? 6 : 3,
                                height: i % 3 === 0 ? 6 : 3,
                                background: i % 2 === 0 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                            }}
                            animate={{
                                y: [0, -40, 0],
                                x: [0, i % 2 === 0 ? 15 : -15, 0],
                                opacity: [0.1, 0.5, 0.1],
                            }}
                            transition={{
                                duration: 4 + i * 0.7,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>

                {/* Giant Background Text */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-[1]">
                    <motion.h2
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.05 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="text-[18vw] font-bold text-white leading-none tracking-tighter whitespace-nowrap"
                    >
                        harmony
                    </motion.h2>
                </div>

                {/* ===== CENTERED HERO CONTENT ===== */}
                <motion.div
                    className="relative z-[2] text-center max-w-5xl mx-auto px-6"
                    style={{ opacity: contentOpacity, y: contentY }}
                >
                    {/* Main Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                        className="mt-20 md:mt-24"
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1] tracking-tight">
                            Discover
                            <br />
                            Your{' '}
                            <span className="relative inline-block">
                                <motion.span
                                    key={currentWord}
                                    initial={{ y: 80, opacity: 0, rotateX: -45 }}
                                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                    exit={{ y: -80, opacity: 0, rotateX: 45 }}
                                    transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange via-amber-400 to-primary-orange inline-block"
                                >
                                    {heroWords[currentWord]}
                                </motion.span>
                                <motion.div
                                    key={`line-${currentWord}`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
                                    className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-orange to-amber-400 rounded-full origin-left"
                                />
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-white/60 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mt-6 md:mt-8 leading-relaxed"
                    >
                        Furniture that transforms spaces into experiences. Crafted with intention, designed for living.
                    </motion.p>

                    {/* CTA Buttons — Centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-8 md:mt-10"
                    >
                        <Link href="/shop" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto justify-center">
                            Explore Collection
                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                        <Link
                            href="/about"
                            className="text-white/60 text-sm font-medium hover:text-white transition-colors flex items-center gap-3 group"
                        >
                            <span className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-primary-orange group-hover:bg-primary-orange/10 transition-all">
                                <Play className="w-4 h-4 ml-0.5" />
                            </span>
                            Watch Our Story
                        </Link>
                    </motion.div>

                    {/* Glassmorphism Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex bg-white/[0.07] backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden mt-10 md:mt-14 max-w-xl mx-auto"
                    >
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 py-4 sm:py-6 px-3 sm:px-4 text-center ${idx !== stats.length - 1 ? 'border-r border-white/10' : ''}`}
                            >
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-white/40 text-[9px] md:text-[10px] mt-1.5 uppercase tracking-[0.15em] font-medium">{stat.label}</p>
                            </div>
                        ))}
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80" />
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                                            <p className="text-white/80 text-sm font-medium">{cat.productCount} items</p>
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
