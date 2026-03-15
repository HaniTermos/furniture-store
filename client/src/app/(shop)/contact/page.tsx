'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
<<<<<<< HEAD
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/contact`, {
=======
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`, {
>>>>>>> d1d77d0 (dashboard and variants edits)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message.');
            }

            setStatus('success');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setStatus('idle');
        }
    };

    return (
        <main className="bg-white min-h-screen">
            {/* Dark Hero - ensures navbar text is visible */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/20 text-primary-orange text-xs font-bold mb-6"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>GET IN TOUCH</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-white"
                    >
                        How Can We Help You?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-lg max-w-lg mx-auto"
                    >
                        Have a question about a product, or want to discuss a custom project? Reach out to our design consultants today.
                    </motion.p>
                </div>
            </section>

            <div className="container-wide px-6 py-16">

                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-orange">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Email Us</h3>
                                <p className="text-neutral-500 text-sm mb-2">For general inquiries and support.</p>
                                <a href="mailto:hello@hightechwood.com" className="font-semibold text-primary-orange hover:underline decoration-2">hello@hightechwood.com</a>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-orange">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Call Us</h3>
                                <p className="text-neutral-500 text-sm mb-2">Mon-Fri from 9am to 6pm EST.</p>
                                <a href="tel:+15550000000" className="font-semibold text-primary-orange hover:underline decoration-2">+1 (555) 000-0000</a>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-orange">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Visit Studio</h3>
                                <p className="text-neutral-500 text-sm mb-2">Come see our craftsmanship in person.</p>
                                <p className="font-semibold text-neutral-900 leading-relaxed">
                                    123 Design District St.<br />
                                    Brooklyn, NY 11201
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-neutral-50 rounded-3xl p-8 md:p-12 border border-neutral-100"
                        >
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="py-12 text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                                            <p className="text-neutral-500">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                                        </div>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="btn-outline"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form key="form" onSubmit={handleSubmit} className="space-y-6">
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
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-neutral-700 ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 px-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-neutral-700 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="john@example.com"
                                                    className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 px-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-700 ml-1">Topic</label>
                                            <select
                                                required
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 px-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all appearance-none cursor-pointer"
                                            >
                                                <option>General Inquiry</option>
                                                <option>Custom Project Request</option>
                                                <option>Existing Order Support</option>
                                                <option>Partnership Interest</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-700 ml-1">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Tell us about your project or ask a question..."
                                                className="w-full bg-white border border-neutral-200 rounded-2xl py-4 px-4 outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full bg-primary-black hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {status === 'loading' ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-24 h-96 w-full bg-neutral-100 relative group overflow-hidden">
                <div className="absolute inset-0 grayscale contrast-125 opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center italic text-neutral-400 font-serif">
                    Interactive Workspace Map Placeholder
                </div>
            </div>
        </main>
    );
}
