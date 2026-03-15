'use client';

import Link from 'next/link';
import Image from 'next/image';
<<<<<<< HEAD
import { usePathname } from 'next/navigation';
=======
import { usePathname, useRouter } from 'next/navigation';
>>>>>>> d1d77d0 (dashboard and variants edits)
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
    ChevronLeft,
    ChevronRight,
    Tag,
    Warehouse,
    Bell,
    Search,
    Star,
    UserCog,
    Settings2,
    Mail,
    Activity,
} from 'lucide-react';
<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
=======
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
>>>>>>> d1d77d0 (dashboard and variants edits)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { Toaster } from 'react-hot-toast';
<<<<<<< HEAD
import { useTheme } from 'next-themes';
import SearchPalette from '@/components/admin/SearchPalette';
import { Moon, Sun } from 'lucide-react';
=======
import SearchPalette from '@/components/admin/SearchPalette';
>>>>>>> d1d77d0 (dashboard and variants edits)

const sidebarSections = [
    {
        label: 'Overview',
        items: [
            { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { href: '/admin/products', label: 'Products', icon: Package },
            { href: '/admin/categories', label: 'Categories', icon: LayoutDashboard },
            { href: '/admin/attributes', label: 'Attributes', icon: Settings2 },
            { href: '/admin/tags', label: 'Tags', icon: Tag },
            { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { href: '/admin/customers', label: 'Customers', icon: Users },
        ],
    },
    {
        label: 'Operations',
        items: [
            { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
            { href: '/admin/coupons', label: 'Coupons', icon: Tag },
            { href: '/admin/reviews', label: 'Reviews', icon: Star },
            { href: '/admin/messages', label: 'Messages', icon: Mail },
            { href: '/admin/size-guides', label: 'Size Guides', icon: Package },
        ],
    },
    {
        label: 'System',
        items: [
            { href: '/admin/settings?tab=staff', label: 'Staff & Roles', icon: UserCog },
            { href: '/admin/activity', label: 'Activity Log', icon: Activity },
            { href: '/admin/settings', label: 'Settings', icon: Settings },
        ],
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, token, logout: storeLogout } = useAppStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
<<<<<<< HEAD
    const [isChecking, setIsChecking] = useState(true);
=======
    const [mounted, setMounted] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
>>>>>>> d1d77d0 (dashboard and variants edits)
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const queryClient = useQueryClient();

    const { data: notificationData } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: () => api.getNotifications({ limit: 5 }),
        refetchInterval: 30000, // Poll every 30s
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.markNotificationRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
    });

    const clearAllMutation = useMutation({
        mutationFn: () => api.clearNotifications(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
    });

    const notifications = notificationData?.notifications || [];
    const unreadCount = notificationData?.unreadCount || 0;

<<<<<<< HEAD
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setIsChecking(false);
    }, []);

    useEffect(() => {
        if (isChecking) return;
        if (!token || !user) {
            router.push('/login');
        } else if (!['admin', 'manager', 'super_admin'].includes(user.role as string)) {
            router.push('/');
        }
    }, [user, token, router, isChecking]);
=======
    // Step 1: wait for client mount (prevents SSR mismatch)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Step 2: once mounted, validate token with server
    useEffect(() => {
        if (!mounted) return;

        // No credentials in store → redirect immediately
        if (!token || !user) {
            router.replace('/login');
            return;
        }

        // Wrong role → redirect to home
        if (!['admin', 'manager', 'super_admin'].includes(user.role as string)) {
            router.replace('/');
            return;
        }

        // Validate token against server (catches expired / revoked tokens)
        api.getProfile()
            .then(() => setAuthChecked(true))
            .catch(() => {
                storeLogout();
                router.replace('/login');
            });
    }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps
>>>>>>> d1d77d0 (dashboard and variants edits)

    const handleLogout = () => {
        storeLogout();
        router.push('/login');
    };

    // Breadcrumbs from pathname
    const breadcrumbs = pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, arr) => ({
            label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            href: '/' + arr.slice(0, index + 1).join('/'),
            isLast: index === arr.length - 1,
        }));

<<<<<<< HEAD
    if (isChecking || !token || !user || !['admin', 'manager', 'super_admin'].includes(user.role as string)) {
=======
    // Show spinner until mount + server auth check complete
    if (!mounted || !authChecked || !user) {
>>>>>>> d1d77d0 (dashboard and variants edits)
        return (
            <div className="min-h-screen bg-[var(--admin-bg)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary-orange border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex selection:bg-primary-orange/20 bg-[var(--admin-bg)] text-[var(--admin-text-primary)]">
            <Toaster position="top-right" />
            {/* ─── Sidebar ──────────────────────────────────────── */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[var(--admin-sidebar)] border-r border-[var(--admin-sidebar-border)] text-[var(--admin-text-primary)] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'
                    } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className={`flex items-center h-16 px-4 border-b border-[var(--admin-sidebar-border)] ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <Image src="/images/logo.png" alt="HTW" fill sizes="32px" className="object-contain" />
                    </div>
                    {!collapsed && <span className="font-bold text-lg tracking-tight">HTW Admin</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                    {sidebarSections.map((section) => (
                        <div key={section.label}>
                            {!collapsed && (
                                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                                    {section.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((link) => {
                                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setSidebarOpen(false)}
                                            title={collapsed ? link.label : undefined}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20'
                                                : 'text-[var(--admin-text-secondary)] hover:bg-neutral-50 hover:text-[var(--admin-text-primary)]'
                                                } ${collapsed ? 'justify-center' : ''}`}
                                        >
                                            <link.icon className="w-5 h-5 flex-shrink-0" />
                                            {!collapsed && link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-2 border-t border-[var(--admin-sidebar-border)] space-y-1">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--admin-text-secondary)] hover:bg-neutral-50 hover:text-[var(--admin-text-primary)] transition-all justify-center"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        {!collapsed && <span>Collapse</span>}
                    </button>
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--admin-text-secondary)] hover:bg-neutral-50 hover:text-[var(--admin-text-primary)] transition-all ${collapsed ? 'justify-center' : ''
                            }`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && 'Back to Store'}
                    </Link>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ─── Main Content ──────────────────────────────────── */}
            <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-6 h-16 flex items-center bg-[var(--admin-card)]/90 border-[var(--admin-card-border)]`}>
                    <div className="flex items-center gap-4 w-full">
                        {/* Mobile menu btn */}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg">
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Breadcrumbs */}
                        <nav className="hidden md:flex items-center gap-1.5 text-sm">
                            {breadcrumbs.map((crumb) => (
                                <span key={crumb.href} className="flex items-center gap-1.5">
                                    {!crumb.isLast ? (
                                        <>
                                            <Link href={crumb.href} className="text-neutral-400 hover:text-primary-orange transition-colors">
                                                {crumb.label}
                                            </Link>
                                            <span className="text-neutral-300">/</span>
                                        </>
                                    ) : (
                                        <span className="font-medium">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Search Trigger */}
                            <button
                                onClick={() => {
                                    // Trigger CMD+K programmatically if needed or just use the shortcut
                                    const event = new KeyboardEvent('keydown', {
                                        key: 'k',
                                        metaKey: true,
                                        ctrlKey: true,
                                        bubbles: true
                                    });
                                    document.dispatchEvent(event);
                                }}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--admin-card-border)] text-sm transition-colors text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                                <Search className="w-4 h-4" />
                                <span>Search...</span>
                                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500">⌘K</kbd>
                            </button>


                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-2 rounded-lg relative transition-colors hover:bg-neutral-100 ${showNotifications ? 'bg-neutral-100 text-primary-orange' : 'text-neutral-500'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-primary-orange text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl z-50 border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                                                <h4 className="font-black text-sm text-neutral-900">Notifications</h4>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => clearAllMutation.mutate()}
                                                        className="text-[10px] font-black uppercase text-primary-orange hover:underline tracking-widest"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-50">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center gap-2">
                                                        <div className="p-3 bg-neutral-50 rounded-full text-neutral-200"><Bell className="w-6 h-6" /></div>
                                                        <p className="text-xs font-bold text-neutral-400">All caught up!</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notif: any) => (
                                                        <button
                                                            key={notif.id}
                                                            onClick={() => {
                                                                if (!notif.is_read) markReadMutation.mutate(notif.id);
                                                                if (notif.link) {
                                                                    router.push(notif.link);
                                                                    setShowNotifications(false);
                                                                }
                                                            }}
                                                            className={`w-full p-4 flex items-start gap-4 text-left hover:bg-neutral-50 transition-colors relative ${!notif.is_read ? 'bg-orange-50/20' : ''}`}
                                                        >
                                                            {!notif.is_read && (
                                                                <div className="absolute top-5 right-4 w-1.5 h-1.5 rounded-full bg-primary-orange shadow-sm" />
                                                            )}
                                                            <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${notif.type === 'order' ? 'bg-blue-50 text-blue-500' :
                                                                notif.type === 'review' ? 'bg-amber-50 text-amber-500' :
                                                                    notif.type === 'message' ? 'bg-emerald-50 text-emerald-500' :
                                                                        'bg-neutral-100 text-neutral-500'
                                                                }`}>
                                                                <Activity className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-black text-neutral-900 truncate mb-0.5">{notif.title}</p>
                                                                <p className="text-[11px] font-medium text-neutral-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                                <p className="text-[9px] font-bold text-neutral-300 mt-1 uppercase tabular-nums">{format(new Date(notif.created_at), 'MMM dd, h:mm a')}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <Link
                                                    href="/admin/activity"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="block p-3 text-center text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-600 bg-neutral-50/30 border-t border-neutral-50 tracking-[0.2em]"
                                                >
                                                    View Activity Bar
                                                </Link>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* View Store */}
                            <Link href="/" className="hidden sm:block text-sm text-neutral-400 hover:text-primary-orange transition-colors">
                                View Store →
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-orange to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {user.firstName?.charAt(0)?.toUpperCase() || (user as any).name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl z-50 border overflow-hidden bg-white border-[var(--admin-card-border)]">
                                            <div className="p-3 border-b border-[var(--admin-card-border)]">
                                                <p className="font-medium text-sm">{user.firstName ? `${user.firstName} ${user.lastName}` : (user as any).name}</p>
                                                <p className="text-xs text-neutral-400">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-primary-orange/10 text-primary-orange">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <Link href="/admin/settings" className="block px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    Settings
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
            <SearchPalette />
        </div>
    );
}
