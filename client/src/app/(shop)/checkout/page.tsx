'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useCurrency } from '@/hooks/useCurrency';
import { Reveal } from '@/components/motion/Reveal';

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
    const totals = calculateTotal(sub);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = () => {
        setOrderPlaced(true);
        clearCart();
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
                                            const price = item.product.price + (item.selectedSize?.priceAdjustment || 0);
                                            return (
                                                <div key={item.id} className="flex gap-4 py-3 border-b border-neutral-100 last:border-0">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{item.product.name}</p>
                                                        <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-sm">{formatPrice(price * item.quantity).display}</p>
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

                                    <div className="flex gap-4 mt-8">
                                        <button onClick={() => setCurrentStep(2)} className="btn-outline">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                        <button onClick={handlePlaceOrder} className="btn-primary">
                                            Place Order — {totals.formatted.total.display}
                                            <ArrowRight className="w-4 h-4" />
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
