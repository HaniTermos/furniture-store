'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, Truck, CreditCard, Mail, MapPin, Search, Calendar, CheckCircle2, Clock, Map, User } from 'lucide-react';
import Image from 'next/image';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
};

interface OrderItem {
    product_id: string;
    name: string;
    sku?: string;
    image?: string;
    price: string | number;
    quantity: number;
    options?: Record<string, unknown>;
}

// Next.js 13+ app directory, unwrapping params correctly if needed.
export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderId = params.id;

    const [trackingNumber, setTrackingNumber] = useState('');
    const [notes, setNotes] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-order', orderId],
        queryFn: () => api.getAdminOrderDetail(orderId),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (config: { status: string; tracking?: string; note?: string }) =>
            api.updateOrderStatus(orderId, { status: config.status, trackingNumber: config.tracking, notes: config.note }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] }),
    });

    if (isLoading) {
        return <div className="p-8"><div className="w-full h-64 bg-neutral-100 rounded-2xl animate-pulse" /></div>;
    }

    const order = data?.order;
    if (!order) {
        return (
            <div className="p-12 text-center">
                <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-medium text-lg">Order not found</h3>
                <Link href="/admin/orders" className="text-primary-orange hover:underline text-sm mt-2 inline-block">Back to orders</Link>
            </div>
        );
    }

    const shipping = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order.shipping_address || {});
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Order #{order.order_number}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColors[order.status] || 'bg-neutral-100'}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" /> {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ status: e.target.value })}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-colors shadow-sm ${statusColors[order.status] || 'bg-neutral-100 text-neutral-700'}`}
                    >
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column (Items & Timeline) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2"><Package className="w-4 h-4" /> Order Items</h3>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {items.map((item: OrderItem, i: number) => (
                                <div key={i} className="p-6 flex items-start gap-4">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/admin/products/${item.product_id}`} className="font-medium text-base hover:text-primary-orange transition-colors line-clamp-1">{item.name}</Link>
                                        <p className="text-sm text-neutral-500 font-mono mt-1">SKU: {item.sku || 'N/A'}</p>
                                        {item.options && Object.keys(item.options).length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {Object.entries(item.options).map(([k, v]: [string, unknown]) => (
                                                    <span key={k} className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-neutral-600 capitalize">
                                                        {k}: {String(v)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-medium">${Number(item.price).toFixed(2)}</p>
                                        <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                        <p className="font-semibold text-primary-orange mt-2">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-neutral-50 p-6 space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="font-medium">${(Number(order.total_amount) - 15).toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-neutral-500">Shipping</span><span className="font-medium">$15.00</span></div>
                            {order.coupon_code && (
                                <div className="flex justify-between text-sm text-emerald-600"><span className="flex items-center gap-1">Discount ({order.coupon_code})</span><span>-</span></div>
                            )}
                            <div className="pt-3 border-t border-neutral-200 flex justify-between">
                                <span className="font-semibold text-base">Total</span><span className="font-bold text-lg">${Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Fulfillment */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2"><Truck className="w-4 h-4" /> Fulfillment & Tracking</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Tracking Number</label>
                                    <input value={trackingNumber || order.tracking_number || ''} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 1Z9999999999999999" className="w-full px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:ring-2 focus:ring-primary-orange/20 outline-none transition-all" />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={() => updateStatusMutation.mutate({ status: 'shipped', tracking: trackingNumber })} disabled={!trackingNumber || updateStatusMutation.isPending} className="px-6 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">Save</button>
                                </div>
                            </div>

                            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-neutral-100 bg-white shadow-sm ml-4 md:ml-0 md:mr-8 md:group-odd:ml-8 md:group-odd:mr-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm">Order Placed</span>
                                            <span className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {order.shipped_at && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-purple-500 text-white shadow shrink-0 z-10">
                                            <Truck className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-neutral-100 bg-white shadow-sm ml-4 md:ml-0 md:mr-8 md:group-odd:ml-8 md:group-odd:mr-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm">Order Shipped</span>
                                                <span className="text-xs text-neutral-400">{new Date(order.shipped_at).toLocaleString()}</span>
                                            </div>
                                            {order.tracking_number && <p className="text-sm text-neutral-500 mt-2">Tracking: <span className="font-mono text-primary-orange">{order.tracking_number}</span></p>}
                                        </div>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 z-10">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-neutral-100 bg-white shadow-sm ml-4 md:ml-0 md:mr-8 md:group-odd:ml-8 md:group-odd:mr-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm">Delivered</span>
                                                <span className="text-xs text-neutral-400">{new Date(order.delivered_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Customer & Payment) */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Customer</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.user_id ? (
                                <Link href={`/admin/customers/${order.user_id}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-primary-orange/10 text-primary-orange rounded-full flex items-center justify-center font-bold">{order.customer_name?.charAt(0) || 'U'}</div>
                                    <div>
                                        <p className="font-medium group-hover:text-primary-orange transition-colors">{order.customer_name}</p>
                                        <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> {order.guest_email}</p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center"><User className="w-5 h-5" /></div>
                                    <div>
                                        <p className="font-medium text-neutral-700">Guest Checkout</p>
                                        <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> {order.guest_email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-neutral-100">
                                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Map className="w-3.5 h-3.5" /> Shipping Address</h4>
                                <p className="text-sm font-medium">{shipping.firstName} {shipping.lastName}</p>
                                <p className="text-sm text-neutral-500">{shipping.address}</p>
                                {shipping.apartment && <p className="text-sm text-neutral-500">{shipping.apartment}</p>}
                                <p className="text-sm text-neutral-500">{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                                <p className="text-sm text-neutral-500">{shipping.country || 'USA'}</p>
                                {shipping.phone && <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">📞 {shipping.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-500">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${order.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {order.payment_status || 'Pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-500">Method</span>
                                <span className="text-sm font-medium capitalize flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Stripe</span>
                            </div>
                            {order.payment_intent_id && (
                                <div className="pt-3 border-t border-neutral-100">
                                    <span className="block text-xs text-neutral-500 mb-1">Transaction ID</span>
                                    <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded select-all break-all">{order.payment_intent_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2">Admin Notes</h3>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={notes || order.notes || ''}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add private notes about this order..."
                                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:ring-2 focus:ring-primary-orange/20 outline-none transition-all resize-none h-24 mb-3"
                            />
                            <button
                                onClick={() => updateStatusMutation.mutate({ status: order.status, note: notes })}
                                disabled={updateStatusMutation.isPending || (!notes && !order.notes)}
                                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => window.print()}
                        className="w-full py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all shadow-sm"
                    >
                        <CreditCard className="w-4 h-4" /> Download Invoice (PDF)
                    </button>
                </div>
            </div>

            {/* Printable Invoice Template (Hidden by default) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 text-black">
                <div className="flex justify-between items-start mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-primary-orange mb-1">HTW</h1>
                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Furniture Store</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                        <p className="text-neutral-500 text-sm">#{order.order_number}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3">Bill To:</h3>
                        <p className="font-bold text-lg">{shipping.firstName} {shipping.lastName}</p>
                        <p className="text-neutral-600">{shipping.address}</p>
                        {shipping.apartment && <p className="text-neutral-600">{shipping.apartment}</p>}
                        <p className="text-neutral-600">{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                        <p className="text-neutral-600">{shipping.country || 'USA'}</p>
                        <p className="text-neutral-600 mt-2">{order.guest_email}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3">Order Info:</h3>
                        <p className="text-sm mb-1"><span className="text-neutral-400 font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-sm mb-1"><span className="text-neutral-400 font-medium">Status:</span> {order.status}</p>
                        <p className="text-sm"><span className="text-neutral-400 font-medium">Payment:</span> {order.payment_status}</p>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-neutral-900 text-left">
                            <th className="py-4 font-black uppercase text-xs">Item Description</th>
                            <th className="py-4 font-black uppercase text-xs text-center">Qty</th>
                            <th className="py-4 font-black uppercase text-xs text-right">Price</th>
                            <th className="py-4 font-black uppercase text-xs text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {items.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="py-4">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-xs text-neutral-400 font-mono mt-0.5">SKU: {item.sku || 'N/A'}</p>
                                    {item.options && (
                                        <p className="text-xs text-neutral-500 mt-1 capitalize">
                                            {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                        </p>
                                    )}
                                </td>
                                <td className="py-4 text-center">{item.quantity}</td>
                                <td className="py-4 text-right">${Number(item.price).toFixed(2)}</td>
                                <td className="py-4 text-right font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end uppercase">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-neutral-400 font-bold">Subtotal</span><span className="font-bold">${(Number(order.total_amount) - 15).toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-neutral-400 font-bold">Shipping</span><span className="font-bold">$15.00</span></div>
                        <div className="flex justify-between pt-3 border-t-2 border-neutral-900 font-black text-xl">
                            <span>Total</span><span>${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t text-center">
                    <p className="text-sm font-bold text-neutral-400 italic">Thank you for shopping with HTW Furniture Store!</p>
                </div>
            </div>
        </div>
    );
}
