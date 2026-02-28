'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { formatPrice } = useCurrency();
    const addItem = useCartStore((s) => s.addItem);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="group"
        >
            <Link href={`/shop/${product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden mb-4">
                    <Image
                        src={product.images[0]?.url || '/images/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out-expo"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {product.isNew && (
                            <span className="bg-primary-orange text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                New
                            </span>
                        )}
                        {product.originalPrice && (
                            <span className="bg-primary-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                Sale
                            </span>
                        )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault();
                                addItem(product, 1, product.colors[0]);
                            }}
                            className="flex-1 bg-white text-primary-black text-sm font-medium py-2.5 rounded-full hover:bg-primary-orange hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault();
                                alert('Added to wishlist!');
                            }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
                            aria-label="Add to wishlist"
                        >
                            <Heart className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-neutral-900 group-hover:text-primary-orange transition-colors duration-200 line-clamp-1">
                            {product.name}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-orange transition-colors duration-200 flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-1">{product.shortDescription}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                            {formatPrice(product.price).display}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-neutral-400 line-through">
                                {formatPrice(product.originalPrice).display}
                            </span>
                        )}
                    </div>
                    {/* Color swatches */}
                    {product.colors.length > 0 && (
                        <div className="flex gap-1.5 pt-1">
                            {product.colors.slice(0, 5).map((color) => (
                                <span
                                    key={color.id}
                                    className="w-3.5 h-3.5 rounded-full border border-neutral-200"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
