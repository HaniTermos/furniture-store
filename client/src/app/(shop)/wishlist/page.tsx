'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
    const { items } = useWishlistStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null; // Avoid hydration mismatch

    return (
        <main className="min-h-screen pt-24 pb-20 bg-neutral-50">
            <div className="container-wide section-padding">
                <div className="mb-12 md:mb-16 mt-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
                        Your Wishlist
                    </h1>
                    <p className="text-neutral-500 text-lg">
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved for later.
                    </p>
                </div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-neutral-100"
                    >
                        <ShoppingBag className="w-16 h-16 text-neutral-200 mb-6" />
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            It's empty here!
                        </h2>
                        <p className="text-neutral-500 max-w-md mx-auto mb-8">
                            You haven't saved any items to your wishlist yet. Discover our collection and save your favorites.
                        </p>
                        <Link
                            href="/shop"
                            className="bg-primary-black text-white px-8 py-4 rounded-full font-medium hover:bg-primary-orange transition-colors flex items-center gap-2 group"
                        >
                            Explore Collection
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
                        {items.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
