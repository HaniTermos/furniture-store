'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useCurrency } from '@/hooks/useCurrency';

export default function CartDrawer() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
    const { formatPrice, calculateTotal, showLbp } = useCurrency();
    const itemCount = items.length;
    const sub = subtotal();
    const totals = calculateTotal(sub);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/60 z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Your Cart</h2>
                                <span className="bg-primary-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {itemCount}
                                </span>
                            </div>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                aria-label="Close cart"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag className="w-16 h-16 text-neutral-200 mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
                                    <p className="text-neutral-400 text-sm mb-6">
                                        Looks like you haven&apos;t added anything yet.
                                    </p>
                                    <button onClick={closeCart} className="btn-primary">
                                        Continue Shopping
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => {
                                        const price = item.variant
                                            ? Number(item.variant.price)
                                            : (Number(item.product.base_price ?? item.product.price ?? 0) + (item.selectedSize?.priceAdjustment || 0));
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 100 }}
                                                className="flex gap-4"
                                            >
                                                <div className="relative w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    {item.product.images[0] && (
                                                        <Image
                                                            src={item.product.images[0].url}
                                                            alt={item.product.name}
                                                            fill
                                                            sizes="80px"

                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {item.selectedColor && (
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-neutral-200"
                                                                style={{ backgroundColor: item.selectedColor.hex }}
                                                            />
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="text-xs text-neutral-400">
                                                                {item.selectedSize.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex items-center border border-neutral-200 rounded-full">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <span className="font-semibold text-sm">
                                                            {formatPrice(price * item.quantity).display}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-full transition-colors self-start"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-neutral-100 p-6 space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span className="font-medium">{totals.formatted.subtotal.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Tax ({(totals.taxUsd / sub * 100).toFixed(0)}%)</span>
                                        <span className="font-medium">{totals.formatted.tax.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Shipping</span>
                                        <span className="font-medium">
                                            {totals.shippingUsd === 0 ? 'Free' : totals.formatted.shipping.display}
                                        </span>
                                    </div>
                                    <div className="border-t border-neutral-100 pt-2 flex justify-between">
                                        <span className="font-semibold">Total</span>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{totals.formatted.total.display}</p>
                                            {!showLbp && <p className="text-xs text-neutral-400">{totals.formatted.total.lbp}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="btn-primary w-full justify-center text-base"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
