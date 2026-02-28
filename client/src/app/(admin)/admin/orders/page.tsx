'use client';

import { useState } from 'react';
import { Search, Eye, Download } from 'lucide-react';

const mockOrders = [
    { id: 'HTW-A1B2C3', customer: 'Sarah M.', email: 'sarah@email.com', amount: 329, items: 3, status: 'delivered', date: '2024-03-15' },
    { id: 'HTW-D4E5F6', customer: 'Ahmad K.', email: 'ahmad@email.com', amount: 110, items: 1, status: 'processing', date: '2024-03-14' },
    { id: 'HTW-G7H8I9', customer: 'Nour L.', email: 'nour@email.com', amount: 548, items: 2, status: 'shipped', date: '2024-03-14' },
    { id: 'HTW-J1K2L3', customer: 'Marc D.', email: 'marc@email.com', amount: 189, items: 1, status: 'pending', date: '2024-03-13' },
    { id: 'HTW-M4N5O6', customer: 'Layla B.', email: 'layla@email.com', amount: 710, items: 4, status: 'delivered', date: '2024-03-12' },
    { id: 'HTW-P7Q8R9', customer: 'Omar S.', email: 'omar@email.com', amount: 249, items: 1, status: 'cancelled', date: '2024-03-11' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filtered = mockOrders.filter((o) => {
        const matchSearch =
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
                    <p className="text-neutral-400 text-sm mt-1">{mockOrders.length} total orders</p>
                </div>
                <button className="btn-outline text-sm">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s === 'all' ? null : s)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${(s === 'all' && !statusFilter) || statusFilter === s
                                ? 'bg-primary-black text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Order</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Customer</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Items</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Amount</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Status</th>
                                <th className="text-left font-medium text-neutral-400 px-6 py-3">Date</th>
                                <th className="text-right font-medium text-neutral-400 px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => (
                                <tr key={order.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{order.customer}</p>
                                            <p className="text-xs text-neutral-400">{order.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-500">{order.items}</td>
                                    <td className="px-6 py-4 font-medium">${order.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-400">{order.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors" aria-label="View order">
                                            <Eye className="w-4 h-4 text-neutral-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
