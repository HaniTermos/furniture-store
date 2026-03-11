'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAppStore } from '@/store';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Support' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, showLbp, toggleCurrency } = useAppStore();
    const totalItems = useCartStore((s) => s.totalItems());
    const wishlistItemsCount = useWishlistStore((s) => s.items.length);
    const openCart = useCartStore((s) => s.openCart);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isDarkHeaderPage = pathname === '/' || pathname === '/shop' || pathname === '/about' || (pathname?.startsWith('/shop/') && pathname.split('/').length > 2);
    const useDarkText = scrolled || !isDarkHeaderPage;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className={`fixed top-0 left-0 right-0 z-[var(--z-fixed)] transition-all duration-500 ${scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100'
                    : 'bg-transparent'
                    }`}
            >
                <nav className="container-wide section-padding">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 z-10" onClick={closeMobileMenu}>
                            <div className="relative w-10 h-10 md:w-12 md:h-12">
                                <Image
                                    src="/images/logo.png"
                                    alt="High Tech Wood"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span
                                className={`hidden md:inline text-lg md:text-xl font-bold tracking-tight transition-colors duration-300 ${useDarkText ? 'text-neutral-900' : 'text-white'
                                    }`}
                            >
                                High Tech Wood
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors duration-300 hover:text-primary-orange ${useDarkText ? 'text-neutral-600' : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 z-10">
                            <button
                                onClick={toggleCurrency}
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 border flex items-center justify-center min-w-[32px] sm:min-w-[48px] ${useDarkText
                                    ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                    : 'border-white/20 text-white hover:bg-white/10'
                                    }`}
                                aria-label="Toggle Currency"
                            >
                                <span className="sm:hidden">{showLbp ? 'LBP' : '$'}</span>
                                <span className="hidden sm:inline">{showLbp ? 'LBP' : 'USD'}</span>
                            </button>

                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${useDarkText
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-white/10 text-white/80'
                                    }`}
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <Link
                                href="/login"
                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hidden md:flex ${useDarkText
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-white/10 text-white/80'
                                    }`}
                                aria-label="Account"
                            >
                                <User className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/wishlist"
                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 relative hidden sm:flex ${useDarkText
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-white/10 text-white/80'
                                    }`}
                                aria-label="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                {isMounted && wishlistItemsCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-orange text-white text-[10px] font-bold flex items-center justify-center border-2 border-primary-orange"
                                    >
                                        {wishlistItemsCount}
                                    </motion.span>
                                )}
                            </Link>

                            <button
                                onClick={openCart}
                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 relative ${useDarkText
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-white/10 text-white/80'
                                    }`}
                                aria-label="Cart"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isMounted && totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className={`lg:hidden p-1.5 sm:p-2 rounded-full transition-all duration-300 ${useDarkText
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-white/10 text-white/80'
                                    }`}
                                aria-label="Menu"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Search Bar */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-neutral-200 bg-white overflow-hidden"
                        >
                            <div className="container-wide section-padding py-4">
                                <input
                                    type="text"
                                    placeholder="Search for furniture..."
                                    className="w-full text-lg outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
                                    autoFocus
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black/60" onClick={closeMobileMenu} />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl"
                        >
                            <div className="flex flex-col h-full pt-24 px-8">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={closeMobileMenu}
                                            className="block py-4 text-xl font-medium text-neutral-900 border-b border-neutral-100 hover:text-primary-orange transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                <div className="mt-auto pb-8">
                                    <Link
                                        href="/account"
                                        onClick={closeMobileMenu}
                                        className="btn-primary w-full mt-8"
                                    >
                                        <User className="w-4 h-4" />
                                        My Account
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
