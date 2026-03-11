'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function AdminAnalyticsPage() {
    const [period, setPeriod] = useState<string>('30d');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-analytics', period],
        queryFn: () => api.getAdminSalesAnalytics(period),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-sm text-neutral-500">Sales and revenue insights</p>
                </div>
                <div className="flex gap-1 p-1 bg-[var(--admin-card-border)] rounded-xl">
                    {[{ key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' }, { key: '90d', label: '90 Days' }, { key: '1y', label: '1 Year' }].map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${period === p.key ? 'bg-[var(--admin-card)] shadow-sm' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-[var(--admin-card)] border-[var(--admin-card-border)] p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-emerald-100"><DollarSign className="w-4 h-4 text-emerald-600" /></div>
                        <p className="text-sm text-[var(--admin-text-secondary)]">Total Revenue</p>
                    </div>
                    <p className="text-2xl font-bold">${((data?.revenueByDay || []).reduce((sum: number, d: { revenue?: string | number }) => sum + parseFloat(String(d.revenue || 0)), 0)).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border bg-[var(--admin-card)] border-[var(--admin-card-border)] p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-100"><ShoppingCart className="w-4 h-4 text-blue-600" /></div>
                        <p className="text-sm text-[var(--admin-text-secondary)]">Total Orders</p>
                    </div>
                    <p className="text-2xl font-bold">{(data?.revenueByDay || []).reduce((sum: number, d: { orders?: string | number }) => sum + parseInt(String(d.orders || 0)), 0)}</p>
                </div>
                <div className="rounded-2xl border bg-[var(--admin-card)] border-[var(--admin-card-border)] p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-purple-100"><TrendingUp className="w-4 h-4 text-purple-600" /></div>
                        <p className="text-sm text-[var(--admin-text-secondary)]">Average Order Value</p>
                    </div>
                    <p className="text-2xl font-bold">${(data?.averageOrderValue || 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-2xl border bg-white border-neutral-100 p-5">
                <h3 className="font-semibold mb-4">Revenue Trend</h3>
                {isLoading ? (
                    <div className="h-[350px] bg-neutral-100 rounded-xl animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data?.revenueByDay || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }} formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                            <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#F97316' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Orders by Status */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl border bg-[var(--admin-card)] border-[var(--admin-card-border)] p-5">
                    <h3 className="font-semibold mb-4">Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.ordersByStatus || []} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="count" nameKey="status" label={(props: any) => `${props.name}: ${props.value}`} labelLine={false}>
                                {(data?.ordersByStatus || []).map((_: unknown, idx: number) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border bg-[var(--admin-card)] border-[var(--admin-card-border)] p-5">
                    <h3 className="font-semibold mb-4">Orders per Day</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.revenueByDay || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric' })} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                            <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
