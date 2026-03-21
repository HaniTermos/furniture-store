'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useCurrency } from '@/hooks/useCurrency';
import { Reveal } from '@/components/motion/Reveal';
import { api } from '@/lib/api';
import { useAppStore } from '@/store';
import { toast } from 'react-hot-toast';
import { Tag } from 'lucide-react';

const steps = [
    { id: 1, label: 'Shipping', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Review', icon: Package },
];

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const { items, subtotal, clearCart } = useCartStore();
    const { formatPrice, calculateTotal, showLbp } = useCurrency();
    const sub = subtotal();
    
    // Array of coupon definitions
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, type: string} | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const totals = calculateTotal(sub, appliedCoupon?.discount);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Lebanon',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAppStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.error('Please log in to place an order.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Sync local cart to server to ensure accurate order creation
            await api.syncCart(items.map(item => ({
                product_id: item.product.id,
                variant_id: item.variant?.id || null,
                quantity: item.quantity,
                configuration: {
                    color: item.selectedColor?.id,
                    size: item.selectedSize?.id
                }
            })));

            // 2. Place the order
            await api.placeOrder({
                shipping_address: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
                payment_method: 'credit_card',
                coupon_code: appliedCoupon?.code || undefined,
                notes: 'Order placed via website checkout',
            });

            setOrderPlaced(true);
            clearCart();
            toast.success('Order placed successfully!');
        } catch (err: any) {
            const message = err.message || 'Failed to place order. Please try again.';
            setError(message);
            toast.error(message);
            console.error('Checkout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        try {
            // We pass the base subtotal to check minimum purchase
            const res = await api.validateCoupon(couponCode);
            setAppliedCoupon({
                code: res.coupon.code,
                discount: res.discount,
                type: res.coupon.type
            });
            toast.success('Coupon applied successfully!');
            setCouponCode('');
        } catch (err: any) {
            toast.error(err.message || 'Invalid or expired coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        toast.success('Coupon removed');
    };

    if (orderPlaced) {
        return (
            <>
                <div className="h-20" />
                <section className="py-32 text-center">
                    <div className="container-wide section-padding">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        </motion.div>
                        <Reveal>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">Order Confirmed!</h1>
                            <p className="text-neutral-500 text-lg mb-2">
                                Thank you for your purchase.
                            </p>
                            <p className="text-neutral-400 mb-8">
                                Order #HTW-{Math.random().toString(36).substring(2, 8).toUpperCase()} — You&apos;ll
                                receive a confirmation email shortly.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/shop" className="btn-primary">
                                    Continue Shopping
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/account/orders" className="btn-outline">
                                    View Orders
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </>
        );
    }

    if (items.length === 0) {
        return (
            <>
                <div className="h-20" />
                <section className="py-32 text-center">
                    <div className="container-wide section-padding">
                        <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
                        <Link href="/shop" className="btn-primary mt-4">
                            Start Shopping <ArrowRight className="w-4 h-4" />
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
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep === step.id
                                        ? 'bg-primary-black text-white'
                                        : currentStep > step.id
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-neutral-100 text-neutral-400'
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <step.icon className="w-4 h-4" />
                                    )}
                                    <span className="hidden md:inline">{step.label}</span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`w-8 md:w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-300' : 'bg-neutral-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
                        {/* Form Area */}
                        <div>
                            {/* Step 1: Shipping */}
                            {currentStep === 1 && (
                                <Reveal>
                                    <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">First Name</label>
                                            <input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Last Name</label>
                                            <input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Email</label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Phone</label>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="+961 XX XXX XXX"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1.5">Address</label>
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="Street address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">City</label>
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="Beirut"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Zip Code</label>
                                            <input
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="1100"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="btn-primary mt-8"
                                    >
                                        Continue to Payment
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Reveal>
                            )}

                            {/* Step 2: Payment */}
                            {currentStep === 2 && (
                                <Reveal>
                                    <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
                                        🧪 <strong>Test Mode</strong> — Use card number 4242 4242 4242 4242 with any future date and CVC.
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Card Number</label>
                                            <input
                                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                placeholder="4242 4242 4242 4242"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Expiry</label>
                                                <input
                                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">CVC</label>
                                                <input
                                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={() => setCurrentStep(1)} className="btn-outline">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                        <button onClick={() => setCurrentStep(3)} className="btn-primary">
                                            Review Order
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Reveal>
                            )}

                            {/* Step 3: Review */}
                            {currentStep === 3 && (
                                <Reveal>
                                    <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                                    <div className="space-y-4">
                                        {items.map((item) => {
                                            const basePrice = Number(item.variant?.price ?? item.product.base_price ?? item.product.price ?? 0);
                                            const sizeAdjustment = item.selectedSize?.priceAdjustment || 0;
                                            const finalPrice = basePrice + sizeAdjustment;
                                            return (
                                                <div key={item.id} className="flex gap-4 py-3 border-b border-neutral-100 last:border-0">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{item.product.name}</p>
                                                        <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-sm">{formatPrice(finalPrice * item.quantity).display}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 space-y-2 text-sm">
                                        <div className="flex justify-between py-1">
                                            <span className="text-neutral-400">Shipping to</span>
                                            <span>{formData.city || 'Beirut'}, {formData.country}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-neutral-400">Payment</span>
                                            <span>**** 4242</span>
                                        </div>
                                    </div>

                                    {/* Coupon Input on Step 3 */}
                                    <div className="mt-8 pt-6 border-t border-neutral-100">
                                        <h3 className="font-medium mb-3 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-neutral-400" />
                                            Gift Card or Discount Code
                                        </h3>
                                        <div className="flex gap-2">
                                            <input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Enter code"
                                                className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all uppercase"
                                                disabled={isApplyingCoupon || !!appliedCoupon}
                                            />
                                            <button 
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode.trim() || isApplyingCoupon || !!appliedCoupon}
                                                className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all"
                                            >
                                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-100">
                                        <button onClick={() => setCurrentStep(2)} className="btn-outline">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                        <button 
                                            onClick={handlePlaceOrder} 
                                            disabled={isLoading}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Processing...' : `Place Order — ${totals.formatted.total.display}`}
                                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </Reveal>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:sticky lg:top-28 self-start">
                            <div className="bg-neutral-50 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Subtotal ({items.length} items)</span>
                                        <span className="font-medium">{totals.formatted.subtotal.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Tax</span>
                                        <span className="font-medium">{totals.formatted.tax.display}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Shipping</span>
                                        <span className="font-medium">
                                            {totals.shippingUsd === 0 ? 'Free' : totals.formatted.shipping.display}
                                        </span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5" />
                                                Discount ({appliedCoupon.code})
                                                <button onClick={handleRemoveCoupon} className="text-xs text-neutral-400 hover:text-red-500 underline ml-2">Remove</button>
                                            </span>
                                            <span>-{formatPrice(appliedCoupon.discount).display}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-neutral-200 pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-lg">Total</span>
                                            <div className="text-right">
                                                <p className="font-bold text-xl">{totals.formatted.total.display}</p>
                                                {!showLbp && <p className="text-xs text-neutral-400">{totals.formatted.total.lbp}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
