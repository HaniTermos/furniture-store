'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import PriceDisplay from '@/components/product/PriceDisplay';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { formatPrice } = useCurrency();
    const router = useRouter();
    const addItem = useCartStore((s) => s.addItem);
    const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
    const inWishlist = isInWishlist(product.id);
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeWishlist(product.id);
        } else {
            addWishlist(product);
        }
    };

    return (
        <Link href={`/shop/${product.slug}`} className="block h-full group">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                className="h-full flex flex-col cursor-pointer"
            >
                <div className="flex flex-col w-full h-full">
                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden mb-4 shrink-0">
                        <Image
                            src={hoveredImage || product.images[0]?.url || '/images/placeholder.png'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out-expo"
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
                            {product.has_variants ? (
                                <div className="flex-1 bg-white text-primary-black text-sm font-medium py-2.5 rounded-full hover:bg-neutral-900 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2">
                                    <ArrowUpRight className="w-4 h-4" />
                                    View Options
                                </div>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addItem(product, 1, product.colors[0]);
                                    }}
                                    className="flex-1 bg-white text-primary-black text-sm font-medium py-2.5 rounded-full hover:bg-primary-orange hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </motion.button>
                            )}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleWishlist}
                                className={`w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors duration-200 ${inWishlist ? 'text-red-500' : ''}`}
                                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-neutral-900 group-hover:text-primary-orange transition-colors duration-200 line-clamp-1">
                                {product.name}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-orange transition-colors duration-200 flex-shrink-0 mt-1" />
                        </div>
                        <div className="mt-auto pt-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <PriceDisplay product={product} />
                                {product.originalPrice && (
                                    <span className="text-sm text-neutral-400 line-through">
                                        {formatPrice(product.originalPrice).display}
                                    </span>
                                )}
                            </div>
                            {/* Interactive Color swatches (Only show if there are multiple options) */}
                            {product.colors && product.colors.length > 1 && (
                                <div className="flex items-center gap-1.5 pt-2 relative z-10">
                                    {product.colors.slice(0, 5).map((color) => (
                                        <button
                                            key={color.id}
                                            onMouseEnter={() => {
                                                if (color.image) setHoveredImage(color.image);
                                            }}
                                            onMouseLeave={() => setHoveredImage(null)}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            className="w-4 h-4 rounded-full border border-neutral-200 shadow-sm transition-transform hover:scale-125 focus:outline-none"
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                            aria-label={`View ${color.name}`}
                                        />
                                    ))}
                                    {product.colors.length > 5 && (
                                        <span className="text-[10px] text-neutral-400 font-medium ml-1">
                                            +{product.colors.length - 5}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
