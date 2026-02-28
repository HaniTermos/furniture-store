'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await api.login(formData);

            // Save to global store
            setToken(data.token);
            setUser(data.user);

            // Redirect based on role
            if (data.user.role === 'admin' || data.user.role === 'manager') {
                router.push('/admin/dashboard');
            } else {
                router.push('/account');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex text-neutral-900 bg-neutral-50 overflow-hidden">
            {/* Left Side: Animated Brand/Image Area */}
            <div className="hidden lg:flex flex-1 relative bg-primary-black p-12 flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/placeholder.png"
                        alt="Workspace"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
                    <div className="w-12 h-12 relative">
                        <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="text-white text-2xl font-bold tracking-tight">HTW Admin</span>
                </Link>

                <div className="relative z-10 max-w-lg mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                    >
                        Welcome Back to Command Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-neutral-300 text-lg"
                    >
                        Sign in to manage products, view real-time analytics, and process incoming orders.
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl z-0" />
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
                {/* Mobile Background */}
                <div className="absolute inset-0 lg:hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-neutral-100 relative z-10"
                >
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="w-12 h-12 relative">
                            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                        </Link>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold mb-2">Sign in to your account</h2>
                        <p className="text-neutral-500 text-sm">
                            Enter your credentials to securely access your dashboard.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100 overflow-hidden"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@furniture-store.com"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium placeholder:font-normal placeholder:text-neutral-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium placeholder:font-normal placeholder:text-neutral-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-neutral-300 text-primary-orange focus:ring-primary-orange w-4 h-4 cursor-pointer" />
                                <span className="text-neutral-600 font-medium">Remember me</span>
                            </label>
                            <Link href="#" className="font-semibold text-primary-orange hover:text-primary-orange-hover transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-black hover:bg-neutral-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In securely
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-neutral-500">
                        <p>Demo Admin Credentials:</p>
                        <p className="font-mono mt-1 bg-neutral-100 py-1 px-2 rounded-md inline-block text-xs">admin@furniture-store.com / admin123</p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
