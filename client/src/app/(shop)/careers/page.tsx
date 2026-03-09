'use client';

import { motion } from 'framer-motion';
import { Briefcase, Zap, Globe, Coffee, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const benefits = [
    { icon: Globe, title: 'Remote-First', description: 'Work from anywhere in the world, or join us in our beautiful city office.' },
    { icon: Zap, title: 'High Impact', description: 'Your work directly shapes the future of modern home design.' },
    { icon: Coffee, title: 'Wellness First', description: 'Comprehensive health coverage and unlimited PTO to keep you at your best.' },
];

const jobs = [
    { title: 'Senior UX Designer', category: 'Design', type: 'Full-time', location: 'Remote / NY' },
    { title: 'Full Stack Engineer (Next.js)', category: 'Engineering', type: 'Full-time', location: 'Remote' },
    { title: 'Master Woodworker', category: 'Production', type: 'Full-time', location: 'Brooklyn, NY' },
    { title: 'Customer Experience Lead', category: 'Support', type: 'Full-time', location: 'Remote' },
];

export default function CareersPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Hero */}
            <section className="pt-32 pb-20 bg-neutral-50 px-6">
                <div className="container-wide text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 text-primary-orange text-xs font-bold mb-6"
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>WE ARE HIRING</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        Help Us Build the <br /> Future of Home
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-500 text-lg max-w-2xl mx-auto"
                    >
                        Join a diverse team of artisans, engineers, and designers dedicated to creating furniture that lasts a lifetime.
                    </motion.p>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 px-6 container-wide">
                <div className="grid md:grid-cols-3 gap-12">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="space-y-4">
                            <div className="w-12 h-12 bg-primary-orange/10 text-primary-orange rounded-xl flex items-center justify-center">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">{benefit.title}</h3>
                            <p className="text-neutral-500 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-24 px-6 bg-neutral-900 text-white overflow-hidden relative">
                <div className="container-wide relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                            <p className="text-neutral-400">Find the role that fits your passion and expertise.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">All Roles ({jobs.length})</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <span className="px-2 py-0.5 bg-primary-orange text-[10px] font-bold rounded uppercase tracking-wider">New</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                                            <span>{job.category}</span>
                                            <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                                            <span>{job.location}</span>
                                            <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                                            <span>{job.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-primary-orange font-bold group-hover:translate-x-1 transition-transform">
                                        Apply Now
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-neutral-400 mb-6">Don&apos;t see a role that fits?</p>
                        <Link href="/contact" className="btn-outline border-white/20 text-white hover:bg-white/10">
                            Send us an open application
                        </Link>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>
        </main>
    );
}
