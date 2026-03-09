'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

function AcceptInvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [verifying, setVerifying] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token.');
            setVerifying(false);
            return;
        }

        const verify = async () => {
            try {
                const data = await api.verifyInvitation(token);
                setInvitation(data.invitation);
            } catch (err: any) {
                setError(err.message || 'This invitation is invalid or has expired.');
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            await api.acceptInvitation({
                token: token!,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to complete registration.');
        } finally {
            setIsLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary-orange" />
                <p className="text-neutral-500 font-medium">Verifying your invitation...</p>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Invalid Invitation</h2>
                    <p className="text-neutral-500">{error}</p>
                    <Link href="/" className="btn-primary w-full">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex text-neutral-900 bg-neutral-50">
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-neutral-100 relative z-10"
                >
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="w-12 h-12 relative">
                            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-4"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                                    <p className="text-neutral-500">
                                        Welcome to the team, <strong>{invitation?.name}</strong>. Redirecting you to login...
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-primary-orange font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Almost there</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 text-primary-orange text-xs font-bold mb-4">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>OFFICIAL INVITATION</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Setup Your Account</h2>
                                    <p className="text-neutral-500 text-sm">
                                        Hello <strong>{invitation?.name}</strong>, please choose a secure password to complete your registration.
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700 ml-1">Choose Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700 ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-black hover:bg-neutral-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Setting up account...
                                            </>
                                        ) : (
                                            <>
                                                Complete Registration
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}

export default function AcceptInvitationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary-orange" />
            </div>
        }>
            <AcceptInvitationContent />
        </Suspense>
    );
}
