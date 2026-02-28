'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

const sidebarLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/users', label: 'Staff & Roles', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, token } = useAppStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Initial check to ensure hydration is complete and we can access state safely
    useEffect(() => {
        setIsChecking(false);
    }, []);

    // Authorization check
    useEffect(() => {
        if (isChecking) return;

        if (!token || !user) {
            router.push('/login');
        } else if (user.role !== 'admin' && user.role !== 'manager') {
            router.push('/');
        }
    }, [user, token, router, isChecking]);

    // Don't render the dashboard frame at all if we are still checking or unauthorized
    if (isChecking || !token || !user || (user.role !== 'admin' && user.role !== 'manager')) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary-orange border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-64 bg-primary-black text-white z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/images/logo.png"
                                alt="HTW"
                                fill
                                className="object-contain brightness-0 invert"
                            />
                        </div>
                        <span className="font-bold text-lg">HTW Admin</span>
                    </Link>
                </div>

                <nav className="px-3 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-orange text-white'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 left-3 right-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-3 ml-auto">
                            <Link href="/" className="text-sm text-neutral-500 hover:text-primary-orange transition-colors">
                                View Store →
                            </Link>
                            <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-8">{children}</main>
            </div>
        </div>
    );
}
