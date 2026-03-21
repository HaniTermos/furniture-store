'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Eye, Package, Download } from 'lucide-react';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
};

interface Order {
    id: string;
    order_number: string;
    customer_name?: string;
    guest_email?: string;
    created_at: string;
    status: string;
    payment_status: string;
    total_amount: string | number;
}

export default function AdminOrdersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, search, statusFilter],
        queryFn: () => api.getAdminOrders({ page, limit: 20, search, ...(statusFilter && { status: statusFilter }) }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
    });

    const orders = data?.orders || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 20);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-sm text-neutral-500">{total} total orders</p>
                </div>
                <button
                    onClick={async () => {
                        try {
                            const blob = await api.exportData('orders');
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'orders_export.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                        } catch { /* ignore */ }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by order number or customer..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                    />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${statusFilter === s
                                ? 'bg-primary-orange text-white border-primary-orange'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left">
                            <th className="p-4 font-medium text-neutral-500">Order</th>
                            <th className="p-4 font-medium text-neutral-500">Customer</th>
                            <th className="p-4 font-medium text-neutral-500 hidden md:table-cell">Date</th>
                            <th className="p-4 font-medium text-neutral-500">Status</th>
                            <th className="p-4 font-medium text-neutral-500 hidden sm:table-cell">Payment</th>
                            <th className="p-4 font-medium text-neutral-500 text-right">Total</th>
                            <th className="p-4 font-medium text-neutral-500 w-20">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 rounded-lg animate-pulse" /></td></tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500 font-medium">No orders found</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: Order) => (
                                <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="p-4">
                                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-orange hover:underline">
                                            #{order.order_number}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-sm">{order.customer_name || order.guest_email || 'Guest'}</p>
                                    </td>
                                    <td className="p-4 text-neutral-500 hidden md:table-cell text-xs">
                                        {new Date(order.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || 'bg-neutral-100'}`}
                                        >
                                            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.payment_status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <Link href={`/admin/orders/${order.id}`} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors inline-block">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= totalPages).map((p) => (
                            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-orange text-white' : 'border border-neutral-200 hover:bg-neutral-50'}`}>{p}</button>
                        ))}
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
