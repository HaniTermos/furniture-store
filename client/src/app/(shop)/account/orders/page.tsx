'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/store';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Package, ChevronLeft, ChevronRight, Loader2, ShoppingBag,
    Clock, CheckCircle2, Truck, XCircle, ArrowLeft, Eye
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    confirmed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    processing: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    delivered: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    refunded: { icon: XCircle, color: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-100' },
};

export default function CustomerOrdersPage() {
    const { user } = useAppStore();
    const { formatPrice } = useCurrency();
    const [page, setPage] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['customer-orders', page],
        queryFn: () => api.getUserOrders({ page, limit: 10 }),
        enabled: !!user,
    });

    const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['customer-order-detail', expandedOrder],
        queryFn: () => expandedOrder ? api.getOrderDetail(expandedOrder) : null,
        enabled: !!expandedOrder,
    });

    const orders = data?.orders || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 10);

    if (!user) {
        return (
            <main className="min-h-screen bg-white">
                <div className="h-20 bg-primary-black w-full" />
                <div className="container-wide section-padding py-16 text-center">
                    <p className="text-neutral-500 mb-4">Please sign in to view your orders.</p>
                    <Link href="/login" className="btn-primary inline-flex">Sign In</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="h-20 bg-primary-black w-full" />

            <section className="py-12 md:py-16">
                <div className="container-wide section-padding max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/account" className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-neutral-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Order History</h1>
                            <p className="text-sm text-neutral-400">{total} order{total !== 1 ? 's' : ''} placed</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
                            <p className="text-neutral-400 font-medium">Loading your orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No orders yet</h3>
                            <p className="text-neutral-400 mb-6">Start shopping to see your orders here.</p>
                            <Link href="/shop" className="btn-primary inline-flex">Browse Products</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order: any) => {
                                const config = statusConfig[order.status] || statusConfig.pending;
                                const StatusIcon = config.icon;
                                const isExpanded = expandedOrder === order.id;
                                const detail = isExpanded ? orderDetail?.order : null;

                                return (
                                    <div key={order.id} className="bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:border-neutral-200 transition-all">
                                        {/* Order Summary Row */}
                                        <div
                                            className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-neutral-900">#{order.order_number}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-400">
                                                    {format(new Date(order.created_at), 'MMMM dd, yyyy · h:mm a')}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-neutral-900">
                                                    {formatPrice(Number(order.total_amount)).display}
                                                </p>
                                                <p className="text-xs text-neutral-400 capitalize">{order.payment_status}</p>
                                            </div>

                                            <Eye className={`w-4 h-4 transition-colors ${isExpanded ? 'text-primary-orange' : 'text-neutral-300'}`} />
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-neutral-100 p-5 bg-neutral-50/50">
                                                {isLoadingDetail ? (
                                                    <div className="py-8 flex items-center justify-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary-orange" />
                                                        <span className="text-sm text-neutral-400">Loading details...</span>
                                                    </div>
                                                ) : detail?.items ? (
                                                    <div className="space-y-4">
                                                        {/* Order Items */}
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-widest mb-3">Items</h4>
                                                            <div className="space-y-2">
                                                                {detail.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-sm text-neutral-900">{item.product_name}</p>
                                                                            <p className="text-xs text-neutral-400">
                                                                                Qty: {item.quantity} × {formatPrice(Number(item.unit_price)).display}
                                                                            </p>
                                                                        </div>
                                                                        <p className="font-semibold text-sm">
                                                                            {formatPrice(Number(item.unit_price) * item.quantity).display}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Order Totals */}
                                                        <div className="pt-3 border-t border-neutral-200 space-y-1">
                                                            <div className="flex justify-between text-sm text-neutral-500">
                                                                <span>Subtotal</span>
                                                                <span>{formatPrice(Number(detail.subtotal)).display}</span>
                                                            </div>
                                                            {Number(detail.tax_amount) > 0 && (
                                                                <div className="flex justify-between text-sm text-neutral-500">
                                                                    <span>Tax</span>
                                                                    <span>{formatPrice(Number(detail.tax_amount)).display}</span>
                                                                </div>
                                                            )}
                                                            {Number(detail.shipping_amount) > 0 && (
                                                                <div className="flex justify-between text-sm text-neutral-500">
                                                                    <span>Shipping</span>
                                                                    <span>{formatPrice(Number(detail.shipping_amount)).display}</span>
                                                                </div>
                                                            )}
                                                            {Number(detail.discount_amount) > 0 && (
                                                                <div className="flex justify-between text-sm text-emerald-600">
                                                                    <span>Discount</span>
                                                                    <span>-{formatPrice(Number(detail.discount_amount)).display}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                                                                <span>Total</span>
                                                                <span>{formatPrice(Number(detail.total_amount)).display}</span>
                                                            </div>
                                                        </div>

                                                        {/* Shipping Address */}
                                                        {detail.shipping_address && (
                                                            <div className="pt-3">
                                                                <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-widest mb-2">Shipping Address</h4>
                                                                <p className="text-sm text-neutral-600">
                                                                    {(() => {
                                                                        const addr = typeof detail.shipping_address === 'string' ? JSON.parse(detail.shipping_address) : detail.shipping_address;
                                                                        return `${addr.firstName || ''} ${addr.lastName || ''}, ${addr.address || ''}, ${addr.city || ''} ${addr.state || ''} ${addr.zipCode || ''}`;
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-neutral-400 text-center py-4">Order details unavailable.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
