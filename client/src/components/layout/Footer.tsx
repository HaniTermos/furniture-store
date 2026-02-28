'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Mail } from 'lucide-react';

const footerLinks = {
    shop: [
        { label: 'All Products', href: '/shop' },
        { label: 'Living Room', href: '/shop?category=living-room' },
        { label: 'Bedroom', href: '/shop?category=bedroom' },
        { label: 'Dining', href: '/shop?category=dining' },
        { label: 'Office', href: '/shop?category=office' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Our Story', href: '/about#story' },
        { label: 'Sustainability', href: '/about#sustainability' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
    ],
    support: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Shipping', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Warranty', href: '/warranty' },
        { label: 'Track Order', href: '/account/orders' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-primary-black text-white">
            {/* Newsletter */}
            <div className="border-b border-white/10">
                <div className="container-wide section-padding py-16 md:py-20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">Stay in the loop</h3>
                            <p className="text-white/60 text-sm">
                                Subscribe for exclusive offers, new arrivals, and design inspiration.
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <div className="relative flex-1 md:w-80">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full bg-white/10 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary-orange transition-colors"
                                />
                            </div>
                            <button className="btn-primary whitespace-nowrap">
                                Subscribe
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="container-wide section-padding py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/images/logo.png"
                                    alt="High Tech Wood"
                                    fill
                                    className="object-contain brightness-0 invert"
                                />
                            </div>
                            <span className="text-lg font-bold">High Tech Wood</span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            Premium furniture crafted with precision and passion. Every piece tells a story of
                            quality and modern design.
                        </p>
                        <div className="flex gap-3">
                            {['Instagram', 'Facebook', 'Pinterest', 'X'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-primary-orange hover:border-primary-orange hover:text-white transition-all duration-300 text-xs font-medium"
                                    aria-label={social}
                                >
                                    {social[0]}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6 text-white/80">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/50 hover:text-primary-orange transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container-wide section-padding py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} High Tech Wood. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-white/40 text-sm hover:text-white/60 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-white/40 text-sm hover:text-white/60 transition-colors">
                            Terms
                        </Link>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                            <span className="px-2 py-1 border border-white/10 rounded">VISA</span>
                            <span className="px-2 py-1 border border-white/10 rounded">MC</span>
                            <span className="px-2 py-1 border border-white/10 rounded">AMEX</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
