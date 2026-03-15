'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: Heart,
        title: 'Passion for Craft',
        description: 'Every piece is handcrafted with obsession over detail and quality materials.'
    },
    {
        icon: Shield,
        title: 'Built to Last',
        description: 'We believe furniture shouldn’t be disposable. Our designs endure for generations.'
    },
    {
        icon: Zap,
        title: 'Modern Innovation',
        description: 'Blending traditional woodworking with state-of-the-art technology for the perfect fit.'
    },
    {
        icon: Users,
        title: 'Customer Centric',
        description: 'Your home is your sanctuary. We are here to help you make it perfect.'
    }
];

const team = [
    { name: 'Hani Termos', role: 'Founder & Lead Designer', image: '/images/placeholder.png' },
    { name: 'Sarah Wilson', role: 'Head of Operations', image: '/images/placeholder.png' },
    { name: 'Michael Chen', role: 'Master Craftsman', image: '/images/placeholder.png' },
];

export default function AboutPage() {
    return (
        <main className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/placeholder.png"
                    alt="Woodworking workshop"
                    fill
<<<<<<< HEAD
=======
                    sizes="100vw"
>>>>>>> d1d77d0 (dashboard and variants edits)
                    className="object-cover brightness-50"
                    priority
                />
                <div className="relative z-10 container-wide text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/80 max-w-2xl mx-auto"
                    >
                        Redefining modern living through sustainable craftsmanship and timeless design since 2018.
                    </motion.p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 container-wide section-padding">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Crafting the Future of Your Home</h2>
                        <div className="space-y-6 text-neutral-600 leading-relaxed">
                            <p>
                                High Tech Wood began with a simple observation: the world was moving too fast, and the furniture we lived with was becoming increasingly disposable. We wanted to change that.
                            </p>
                            <p>
                                Based in the heart of the design district, our workshop combines the timeless wisdom of traditional woodworking with the precision of modern high-tech tools. This synthesis allows us to create pieces that aren&apos;t just beautiful, but structurally superior.
                            </p>
                            <p>
                                We source only the finest sustainable hardwoods, ensuring that every table, chair, and cabinet we produce respects the environment as much as it enhances your home.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100">
                        <Image
                            src="/images/placeholder.png"
                            alt="Craftsmanship"
                            fill
<<<<<<< HEAD
=======
                            sizes="(max-width: 1024px) 100vw, 50vw"
>>>>>>> d1d77d0 (dashboard and variants edits)
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Features/Values */}
            <section className="py-24 bg-neutral-50">
                <div className="container-wide section-padding">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-neutral-500">The principles that guide every cut, every joint, and every client interaction.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100"
                            >
                                <div className="w-12 h-12 bg-primary-orange/10 text-primary-orange rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold mb-3">{feature.title}</h3>
                                <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 container-wide section-padding">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Meet the Visionaries</h2>
                    <p className="text-neutral-500">A dedicated team of designers, engineers, and artisans working in harmony.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
                    {team.map((member, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-neutral-100">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
<<<<<<< HEAD
=======
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
>>>>>>> d1d77d0 (dashboard and variants edits)
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-bold">{member.name}</h3>
                            <p className="text-neutral-500 text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary-black text-white text-center">
                <div className="container-wide section-padding">
                    <h2 className="text-4xl font-bold mb-8">Ready to transform your space?</h2>
                    <Link href="/shop" className="btn-primary inline-flex">
                        Explore Collection
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
