'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    BarChart3,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    Settings,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { StaggerContainer, StaggerChild, CountUp } from '@/components/motion/Reveal';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: () => api.getAdminDashboard(),
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
                <p>Loading command center data...</p>
            </div>
        );
    }

    const { stats, recentOrders, revenueByDay } = dashboardData || {};

    const dynamicStats = [
        { label: 'Total Revenue', value: Number(stats?.total_revenue || 0), prefix: '$', icon: DollarSign, change: '+12.5%', color: 'bg-green-50 text-green-600' },
        { label: 'Orders', value: Number(stats?.total_orders || 0), suffix: '', icon: ShoppingCart, change: '+8.2%', color: 'bg-blue-50 text-blue-600' },
        { label: 'Products', value: Number(stats?.total_products || 0), suffix: '', icon: Package, change: '+Active', color: 'bg-purple-50 text-purple-600' },
        { label: 'Customers', value: Number(stats?.total_customers || 0), suffix: '', icon: Users, change: '+23%', color: 'bg-orange-50 text-orange-600' },
    ];

    // Compute simple max for the dynamic chart based on real revenue days
    const maxRevenue = revenueByDay?.length
        ? Math.max(...revenueByDay.map((d: any) => Number(d.revenue)))
        : 100;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-neutral-400 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
                </div>
                <Link href="/admin/settings" className="btn-outline text-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                </Link>
            </div>

            {/* Stats Grid */}
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {dynamicStats.map((stat) => (
                    <StaggerChild key={stat.label}>
                        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                                    <TrendingUp className="w-3 h-3" />
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold mt-1">
                                {stat.prefix || ''}
                                <CountUp end={stat.value} suffix={stat.suffix || ''} />
                            </p>
                        </div>
                    </StaggerChild>
                ))}
            </StaggerContainer>

            {/* Charts Area */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">Revenue Overview (30 Days)</h3>
                    </div>
                    {/* Dynamic Chart based on Live Data */}
                    <div className="h-64 flex items-end gap-1 sm:gap-2">
                        {revenueByDay && revenueByDay.length > 0 ? revenueByDay.slice(-14).map((day: any, i: number) => {
                            const heightPerc = maxRevenue > 0 ? (Number(day.revenue) / maxRevenue) * 100 : 0;
                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(5, heightPerc)}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.05 }}
                                    className="flex-1 bg-gradient-to-t from-primary-orange to-primary-orange/60 rounded-t-sm lg:rounded-t-lg group relative"
                                >
                                    {/* Tooltip on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-primary-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                                        ${Number(day.revenue).toFixed(0)}
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                                No recent revenue data available.
                            </div>
                        )}
                    </div>
                    {revenueByDay && revenueByDay.length > 0 && (
                        <div className="flex justify-between mt-2 text-xs text-neutral-400">
                            <span>{new Date(revenueByDay[Math.max(0, revenueByDay.length - 14)]?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span>{new Date(revenueByDay[revenueByDay.length - 1]?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    {[
                        { label: 'Manage Products', href: '/admin/products', icon: Package, count: `${stats?.total_products || 0} active` },
                        { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, count: `${stats?.total_orders || 0} total` },
                        { label: 'Pending Reviews', href: '/admin/dashboard', icon: BarChart3, count: `${stats?.pending_reviews || 0} waiting` },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all group"
                        >
                            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center group-hover:bg-primary-orange/10 transition-colors">
                                <link.icon className="w-5 h-5 text-neutral-600 group-hover:text-primary-orange transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{link.label}</p>
                                <p className="text-xs text-neutral-400">{link.count}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-orange transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-neutral-100">
                <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-semibold text-lg">Recent Orders</h3>
                    <Link
                        href="/admin/orders"
                        className="text-sm text-primary-orange hover:text-primary-orange-hover transition-colors"
                    >
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Order ID</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Customer</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Amount</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Status</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-3 font-mono font-medium">{order.id}</td>
                                    <td className="px-6 py-3">{order.customer}</td>
                                    <td className="px-6 py-3 font-medium">${order.amount}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-neutral-400">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
