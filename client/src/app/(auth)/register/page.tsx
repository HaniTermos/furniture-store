'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAppStore } from '@/store';

export default function RegisterPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setSuccess(true);
            setToken(data.token);
            setUser(data.user);

            setTimeout(() => {
                router.push('/shop');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex text-neutral-900 bg-neutral-50">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary-black items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="/images/placeholder.png"
                        alt="Join our community"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-lg text-white">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="w-16 h-16 bg-primary-orange rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold leading-tight">Create your sanctuary with us.</h1>
                        <p className="text-xl text-neutral-400">Join thousands of design enthusiasts and get exclusive access to new collections and custom furniture tools.</p>

                        <div className="pt-8 space-y-4">
                            {[
                                'Exclusive early access to drops',
                                'Saved custom configurations',
                                'Faster checkout & order tracking',
                                'Expert design consultations'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-neutral-300 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left space-y-2">
                        <Link href="/" className="inline-block mb-6 lg:hidden">
                            <div className="w-10 h-10 relative mx-auto">
                                <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold">Create Account</h2>
                        <p className="text-neutral-500">Already have an account? <Link href="/login" className="text-primary-orange font-bold hover:underline underline-offset-4">Log in here</Link></p>
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-green-900">Welcome to the family!</h3>
                                <p className="text-green-700">Your account has been created successfully. Redirecting you to the shop...</p>
                                <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto mt-4" />
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-start gap-3 border border-red-100"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-4 focus:ring-primary-orange/5 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-4 focus:ring-primary-orange/5 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-4 focus:ring-primary-orange/5 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Confirm</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-4 focus:ring-primary-orange/5 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-orange focus:ring-primary-orange outline-none cursor-pointer" />
                                        <span className="text-xs text-neutral-500 leading-relaxed font-medium">
                                            I agree to the <Link href="/returns" className="text-neutral-900 hover:underline">Terms of Service</Link> and <Link href="/warranty" className="text-neutral-900 hover:underline">Privacy Policy</Link>.
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary-black hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-black/10"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating your account...
                                        </>
                                    ) : (
                                        <>
                                            Join High Tech Wood
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
