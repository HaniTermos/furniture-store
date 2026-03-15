'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useCurrency } from '@/hooks/useCurrency';
import { Reveal } from '@/components/motion/Reveal';

export default function CartPage() {
    const { items, updateQuantity, removeItem, subtotal, clearCart } = useCartStore();
    const { formatPrice, calculateTotal, showLbp } = useCurrency();
    const sub = subtotal();
    const totals = calculateTotal(sub);

    if (items.length === 0) {
        return (
            <>
                <div className="h-20" />
                <section className="py-32 text-center">
                    <div className="container-wide section-padding">
                        <ShoppingBag className="w-20 h-20 text-neutral-200 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
                        <p className="text-neutral-400 text-lg mb-8">
                            Looks like you haven&apos;t found anything you like yet.
                        </p>
                        <Link href="/shop" className="btn-primary text-base px-8">
                            Start Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <div className="h-20" />
            <section className="py-12 md:py-16">
                <div className="container-wide section-padding">
                    <Reveal>
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold">Shopping Cart</h1>
                            <button
                                onClick={clearCart}
                                className="text-sm text-neutral-400 hover:text-red-500 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </Reveal>

                    <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
                        {/* Cart Items */}
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => {
                                    const price = item.product.price + (item.selectedSize?.priceAdjustment || 0);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex gap-6 bg-white rounded-2xl p-4 md:p-6 border border-neutral-100"
                                        >
                                            <Link
                                                href={`/shop/${item.product.slug}`}
                                                className="relative w-24 h-24 md:w-32 md:h-32 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0"
                                            >
                                                {item.product.images[0] && (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        fill
<<<<<<< HEAD
=======
                                                        sizes="(max-width: 768px) 96px, 128px"
>>>>>>> d1d77d0 (dashboard and variants edits)
                                                        className="object-cover"
                                                    />
                                                )}
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-4">
                                                    <div>
                                                        <Link
                                                            href={`/shop/${item.product.slug}`}
                                                            className="font-semibold text-neutral-900 hover:text-primary-orange transition-colors"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
                                                            {item.selectedColor && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <span
                                                                        className="w-3 h-3 rounded-full border border-neutral-200"
                                                                        style={{ backgroundColor: item.selectedColor.hex }}
                                                                    />
                                                                    {item.selectedColor.name}
                                                                </span>
                                                            )}
                                                            {item.selectedSize && (
                                                                <span>• {item.selectedSize.label}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-full transition-colors self-start"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center border border-neutral-200 rounded-full">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="w-10 text-center font-medium text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatPrice(price * item.quantity).display}</p>
                                                        <p className="text-xs text-neutral-400">
                                                            {formatPrice(price).display} each
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:sticky lg:top-28 self-start">
                            <div className="bg-neutral-50 rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span className="font-medium">{totals.formatted.subtotal.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Tax (11%)</span>
                                        <span className="font-medium">{totals.formatted.tax.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Shipping</span>
                                        <span className="font-medium">
                                            {totals.shippingUsd === 0 ? (
                                                <span className="text-green-600">Free</span>
                                            ) : (
                                                totals.formatted.shipping.display
                                            )}
                                        </span>
                                    </div>
                                    {totals.shippingUsd > 0 && (
                                        <p className="text-xs text-neutral-400">
                                            Free shipping on orders over $100
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 my-6" />

                                <div className="flex justify-between items-start mb-6">
                                    <span className="font-semibold text-lg">Total</span>
                                    <div className="text-right">
                                        <p className="font-bold text-xl">{totals.formatted.total.display}</p>
                                        {!showLbp && <p className="text-sm text-neutral-400">{totals.formatted.total.lbp}</p>}
                                    </div>
                                </div>

                                <Link href="/checkout" className="btn-primary w-full justify-center text-base py-4">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <div className="flex items-center justify-center gap-3 mt-4 text-xs text-neutral-400">
                                    <span className="px-2 py-1 border border-neutral-200 rounded">VISA</span>
                                    <span className="px-2 py-1 border border-neutral-200 rounded">MC</span>
                                    <span className="px-2 py-1 border border-neutral-200 rounded">AMEX</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
