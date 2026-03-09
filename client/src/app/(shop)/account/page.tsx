'use client';

import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut, Settings, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { Reveal } from '@/components/motion/Reveal';

const menuItems = [
    { icon: Package, label: 'Order History', href: '/account/orders', desc: 'View and track your orders' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses', desc: 'Manage saved addresses' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', desc: 'Your saved items' },
    { icon: Settings, label: 'Settings', href: '/account/settings', desc: 'Account preferences' },
];

export default function AccountPage() {
    const { user, logout } = useAppStore();

    return (
        <main className="min-h-screen bg-white">
            {/* Dark Hero Spacer */}
            <div className="h-20 bg-primary-black w-full" />

            <section className="py-12 md:py-16">
                <div className="container-wide section-padding max-w-3xl mx-auto">
                    <Reveal>
                        <div className="text-center mb-12">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <User className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h1 className="text-3xl font-bold mb-1">
                                {user ? `${user.firstName} ${user.lastName}` : 'My Account'}
                            </h1>
                            <p className="text-neutral-400">
                                {user ? user.email : 'Sign in to manage your account'}
                            </p>
                        </div>
                    </Reveal>

                    {!user ? (
                        <Reveal delay={0.1}>
                            <div className="bg-neutral-50 rounded-2xl p-8 text-center">
                                <p className="text-neutral-500 mb-6">Please sign in to access your account.</p>
                                <div className="flex gap-4 justify-center">
                                    <Link href="/login" className="btn-primary">
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link href="/register" className="btn-outline">
                                        Create Account
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    ) : (
                        <div className="space-y-4">
                            {menuItems.map((item, idx) => (
                                <Reveal key={item.href} delay={idx * 0.1}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-4 p-5 bg-white border border-neutral-100 rounded-2xl hover:border-neutral-200 hover:shadow-sm transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center group-hover:bg-primary-orange/10 transition-colors">
                                            <item.icon className="w-5 h-5 text-neutral-600 group-hover:text-primary-orange transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.label}</h3>
                                            <p className="text-sm text-neutral-400">{item.desc}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-orange transition-colors" />
                                    </Link>
                                </Reveal>
                            ))}

                            <Reveal delay={0.4}>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 w-full p-5 text-red-500 hover:bg-red-50 rounded-2xl transition-colors mt-6"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </Reveal>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
