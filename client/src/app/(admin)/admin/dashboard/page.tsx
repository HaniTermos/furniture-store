'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    Star,
    AlertTriangle,
    ArrowUpRight,
    Clock,
    Eye,
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { useState } from 'react';

interface RevenueData { date: string; revenue: number; orders: number; }
interface SalesCategory { category: string; revenue: string; count: number; }
interface TopProduct { id: string; name: string; revenue: number; sold: number; }
interface DashboardActivity { id: string; action: string; user_name?: string; entity_type?: string; created_at: string; }
interface DashboardOrder { id: string; order_number: string; customer_name?: string; guest_email?: string; status: string; total_amount: string | number; }

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#EF4444'];

function StatCard({ title, value, change, changeLabel, icon: Icon, color, link }: {
    title: string; value: string | number; change?: number; changeLabel?: string;
    icon: React.ElementType; color: string; link?: string;
}) {
    const isPositive = change !== undefined && change >= 0;
    const Wrapper = link ? Link : 'div';
    return (
        <Wrapper href={link || '#'} className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:shadow-${color}/5 bg-white border-neutral-100`}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-neutral-500">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                            {changeLabel && <span className="text-neutral-400 font-normal">{changeLabel}</span>}
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-${color}/10 text-${color} flex-shrink-0`} style={{
                    backgroundColor: `${color}15`,
                    color: color,
                }}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {link && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                </div>
            )}
        </Wrapper>
    );
}

function RevenueChart({ data }: { data: RevenueData[] }) {
    const [period, setPeriod] = useState<'7d' | '30d'>('30d');
    const chartData = period === '7d' ? data.slice(-7) : data;

    return (
        <div className="rounded-2xl border bg-white border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold">Revenue Overview</h3>
                    <p className="text-sm text-neutral-500">Daily revenue and orders</p>
                </div>
                <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg">
                    {(['7d', '30d'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === p
                                ? 'bg-white shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {p === '7d' ? '7 Days' : '30 Days'}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(0,0,0,0.85)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '13px',
                        }}
                        formatter={(value: unknown) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function SalesByCategoryChart({ data }: { data: SalesCategory[] }) {
    return (
        <div className="rounded-2xl border bg-white border-neutral-100 p-5">
            <h3 className="font-semibold mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data.filter(d => parseFloat(d.revenue) > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        dataKey="revenue"
                        nameKey="category"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
                            if (!percent) return null;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                        labelLine={false}
                    >
                        {data.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                        formatter={(value: unknown) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}

                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function TopProductsChart({ data }: { data: TopProduct[] }) {
    return (
        <div className="rounded-2xl border bg-white border-neutral-100 p-5">
            <h3 className="font-semibold mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} stroke="#9ca3af" fontSize={12} />
                    <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" fontSize={11} tick={{ fill: '#6b7280' }} />
                    <Tooltip
                        contentStyle={{ background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                        formatter={(value: unknown) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#F97316" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function ActivityFeed({ activities }: { activities: DashboardActivity[] }) {
    const actionIcons: Record<string, React.ElementType> = {
        login: Users, register: Users, create_product: Package, update_product: Package,
        update_order_status: ShoppingCart, create_coupon: Star, adjust_stock: AlertTriangle,
    };

    return (
        <div className="rounded-2xl border bg-white border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <Link href="/admin/activity" className="text-xs text-primary-orange hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
                {(activities || []).slice(0, 8).map((a: DashboardActivity) => {
                    const Icon = actionIcons[a.action] || Clock;
                    return (
                        <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                            <div className="p-1.5 rounded-lg bg-primary-orange/10 text-primary-orange flex-shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm">
                                    <span className="font-medium">{a.user_name || 'System'}</span>{' '}
                                    <span className="text-neutral-500">{a.action?.replace(/_/g, ' ')}</span>
                                    {a.entity_type && (
                                        <span className="text-neutral-400"> on {a.entity_type}</span>
                                    )}
                                </p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                    {new Date(a.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {(!activities || activities.length === 0) && (
                    <p className="text-sm text-neutral-400 text-center py-8">No recent activity</p>
                )}
            </div>
        </div>
    );
}

function RecentOrders({ orders }: { orders: DashboardOrder[] }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="rounded-2xl border bg-white border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs text-primary-orange hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-500 border-b border-neutral-100">
                            <th className="pb-3 font-medium">Order</th>
                            <th className="pb-3 font-medium">Customer</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(orders || []).map((order: DashboardOrder) => (
                            <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                                <td className="py-3">
                                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-orange hover:underline">
                                        #{order.order_number}
                                    </Link>
                                </td>
                                <td className="py-3 text-neutral-500">{order.customer_name || order.guest_email || '—'}</td>
                                <td className="py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right font-medium">${Number(order.total_amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!orders || orders.length === 0) && (
                    <p className="text-sm text-neutral-400 text-center py-6">No orders yet</p>
                )}
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => api.getAdminDashboard(),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-neutral-200 rounded-2xl" />
                    ))}
                </div>
                <div className="h-80 bg-neutral-200 rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
                    <p className="text-neutral-500 text-sm">Please check your connection and try again.</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats || {};
    const todayChange = stats.yesterday_revenue > 0
        ? ((stats.today_revenue - stats.yesterday_revenue) / stats.yesterday_revenue) * 100
        : 0;
    const customerChange = stats.new_customers_last_week > 0
        ? ((stats.new_customers_this_week - stats.new_customers_last_week) / stats.new_customers_last_week) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-neutral-500 text-sm mt-1">Welcome back. Here&apos;s your store overview.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Today's Revenue"
                    value={`$${(stats.today_revenue || 0).toFixed(2)}`}
                    change={todayChange}
                    changeLabel="vs yesterday"
                    icon={DollarSign}
                    color="#10B981"
                    link="/admin/analytics"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.total_orders || 0}
                    icon={ShoppingCart}
                    color="#3B82F6"
                    link="/admin/orders"
                />
                <StatCard
                    title="Customers"
                    value={stats.total_customers || 0}
                    change={customerChange}
                    changeLabel="this week"
                    icon={Users}
                    color="#8B5CF6"
                    link="/admin/customers"
                />
                <StatCard
                    title="Products"
                    value={stats.total_products || 0}
                    icon={Package}
                    color="#F97316"
                    link="/admin/products"
                />
            </div>

            {/* Alert Badges */}
            {(stats.pending_reviews > 0 || stats.low_stock_count > 0) && (
                <div className="flex gap-3 flex-wrap">
                    {stats.pending_reviews > 0 && (
                        <Link href="/admin/reviews" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:shadow-md transition-all">
                            <Star className="w-4 h-4" />
                            {stats.pending_reviews} reviews awaiting approval
                        </Link>
                    )}
                    {stats.low_stock_count > 0 && (
                        <Link href="/admin/inventory" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:shadow-md transition-all">
                            <AlertTriangle className="w-4 h-4" />
                            {stats.low_stock_count} items low on stock
                        </Link>
                    )}
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <RevenueChart data={data?.revenueByDay || []} />
                </div>
                <SalesByCategoryChart data={data?.salesByCategory || []} />
            </div>

            {/* Top Products + Recent Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TopProductsChart data={data?.topProducts || []} />
                <RecentOrders orders={data?.recentOrders || []} />
            </div>

            {/* Activity Feed */}
            <ActivityFeed activities={data?.recentActivity || []} />
        </div>
    );
}
