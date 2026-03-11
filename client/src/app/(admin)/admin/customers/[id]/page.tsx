'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mail, Calendar, MapPin, Search, ShoppingCart, DollarSign, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
};

interface CustomerOrder {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: string | number;
}

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const customerId = params.id;

    const { data, isLoading } = useQuery({
        queryKey: ['admin-customer', customerId],
        queryFn: () => api.getAdminCustomerDetail(customerId),
    });

    if (isLoading) {
        return <div className="p-8"><div className="w-full h-64 bg-neutral-100 rounded-2xl animate-pulse" /></div>;
    }

    const { customer, orders, totalSpent, orderCount } = data || {};
    if (!customer) {
        return (
            <div className="p-12 text-center">
                <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-medium text-lg">Customer not found</h3>
                <Link href="/admin/customers" className="text-primary-orange hover:underline text-sm mt-2 inline-block">Back to customers</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
                        <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                            Customer since {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column (Profile & Stats) */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden text-center p-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-orange to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary-orange/20 mb-4">
                            {customer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{customer.name}</h2>
                        <a href={`mailto:${customer.email}`} className="text-sm text-neutral-500 hover:text-primary-orange transition-colors flex items-center justify-center gap-1.5 mt-1">
                            <Mail className="w-3.5 h-3.5" /> {customer.email}
                        </a>

                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${customer.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {customer.is_active ? 'Active Account' : 'Inactive Account'}
                            </span>
                            {customer.email_verified && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    Verified Email
                                </span>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-emerald-600">${(totalSpent || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Orders</p>
                                <p className="text-2xl font-bold">{orderCount || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats/Details */}
                    <div className="rounded-2xl border border-neutral-100 bg-white p-6 space-y-4">
                        <h3 className="font-semibold border-b border-neutral-100 pb-3 mb-4">Additional Details</h3>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-500"><Calendar className="w-4 h-4" /></div>
                            <div><p className="font-medium">Registered</p><p className="text-neutral-500">{new Date(customer.created_at).toLocaleString()}</p></div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-500"><MapPin className="w-4 h-4" /></div>
                            <div><p className="font-medium">Last Login IP</p><p className="text-neutral-500 font-mono">{customer.last_login_ip || 'Never'}</p></div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Orders & Activity) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Order History */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Order History</h3>
                            <span className="text-xs bg-neutral-100 px-2.5 py-1 rounded-full font-medium">{orders?.length || 0} orders</span>
                        </div>
                        {(!orders || orders.length === 0) ? (
                            <div className="p-12 text-center text-neutral-500">
                                <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>This customer hasn&apos;t placed any orders yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 text-neutral-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {orders.map((order: CustomerOrder) => (
                                        <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-orange hover:underline">
                                                    #{order.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                ${Number(order.total_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
