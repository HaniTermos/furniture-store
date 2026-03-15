'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ShoppingCart, Users, Settings, LayoutDashboard, BarChart3, Tag, Warehouse, Star, Mail, UserCog, Activity, X } from 'lucide-react';

const searchItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, category: 'Overview' },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, category: 'Overview' },
    { label: 'Products', href: '/admin/products', icon: Package, category: 'Commerce' },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, category: 'Commerce' },
    { label: 'Customers', href: '/admin/customers', icon: Users, category: 'Commerce' },
    { label: 'Categories', href: '/admin/categories', icon: LayoutDashboard, category: 'Commerce' },
    { label: 'Inventory', href: '/admin/inventory', icon: Warehouse, category: 'Operations' },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag, category: 'Operations' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, category: 'Operations' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, category: 'System' },
    { label: 'Staff & Roles', href: '/admin/settings?tab=staff', icon: UserCog, category: 'System' },
    { label: 'Activity Log', href: '/admin/activity', icon: Activity, category: 'System' },
];

export default function SearchPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    const filteredItems = query === ''
        ? searchItems
        : searchItems.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = useCallback((href: string) => {
        router.push(href);
        setOpen(false);
        setQuery('');
    }, [router]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => (i + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            if (filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex].href);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    if (!open) return null;

    return (
<<<<<<< HEAD
        <div className="fixed inset-0 z-[var(--z-search-palette)] flex items-start justify-center pt-[15vh] p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
=======
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
>>>>>>> d1d77d0 (dashboard and variants edits)
            <div className="fixed inset-0" onClick={() => setOpen(false)} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center px-4 border-b border-neutral-100 dark:border-neutral-800">
                    <Search className="w-5 h-5 text-neutral-400" />
                    <input
                        autoFocus
                        placeholder="Search pages, settings, and more... (Press ↑↓ to navigate)"
                        className="w-full px-4 py-5 bg-transparent border-none outline-none text-base text-neutral-900 dark:text-neutral-100"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black text-neutral-500 uppercase">
                        ESC
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredItems.length === 0 ? (
                        <div className="py-12 text-center">
                            <Search className="w-10 h-10 text-neutral-200 dark:text-neutral-800 mx-auto mb-3" />
                            <p className="text-sm font-medium text-neutral-400">No results found for &quot;{query}&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredItems.map((item, index) => (
                                <button
                                    key={item.href + index}
                                    onClick={() => handleSelect(item.href)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${index === selectedIndex
                                            ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{item.label}</p>
                                        <p className={`text-[10px] uppercase tracking-widest font-black ${index === selectedIndex ? 'text-white/60' : 'text-neutral-400'}`}>
                                            {item.category}
                                        </p>
                                    </div>
                                    {index === selectedIndex && (
                                        <div className="text-[10px] font-black uppercase text-white/80 flex items-center gap-1">
                                            Enter <kbd>↩</kbd>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border dark:border-neutral-700 shadow-sm">↑↓</kbd> Navigate</span>
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border dark:border-neutral-700 shadow-sm">Enter</kbd> Select</span>
                    </div>
                    <span>HTW Admin v1.2</span>
                </div>
            </div>
        </div>
    );
}
