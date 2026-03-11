'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { AlertTriangle, Warehouse, Plus, Minus, Package } from 'lucide-react';

interface LowStockItem {
    id: string;
    product_name: string;
    product_sku: string;
    option_name: string;
    value: string;
    stock_quantity: number;
}

export default function AdminInventoryPage() {
    const queryClient = useQueryClient();
    const [threshold, setThreshold] = useState(10);
    const [adjustModal, setAdjustModal] = useState<{ valueId: string; name: string; currentStock: number } | null>(null);
    const [adjustment, setAdjustment] = useState(0);
    const [reason, setReason] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-low-stock', threshold],
        queryFn: () => api.getAdminLowStock(threshold),
    });

    const adjustMutation = useMutation({
        mutationFn: (data: { valueId: string; adjustment: number; reason: string }) => api.adjustStock(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] }); setAdjustModal(null); setAdjustment(0); setReason(''); },
    });

    const lowStock = data?.lowStock || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-sm text-neutral-500">{lowStock.length} items below threshold</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-500">Alert threshold:</label>
                    <input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 10)} className="w-16 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-center" />
                </div>
            </div>

            {/* Stock Adjustment Modal */}
            {adjustModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setAdjustModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold">Adjust Stock</h2>
                        <p className="text-sm text-neutral-500">{adjustModal.name} — Current: <strong>{adjustModal.currentStock}</strong></p>
                        <div className="flex items-center gap-3 justify-center">
                            <button onClick={() => setAdjustment(a => a - 1)} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Minus className="w-4 h-4" /></button>
                            <input type="number" value={adjustment} onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)} className="w-20 px-3 py-2 rounded-lg border border-neutral-200 text-center font-bold text-lg" />
                            <button onClick={() => setAdjustment(a => a + 1)} className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200"><Plus className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-center text-neutral-500">New stock: <strong>{adjustModal.currentStock + adjustment}</strong></p>
                        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for adjustment..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                        <button
                            onClick={() => adjustMutation.mutate({ valueId: adjustModal.valueId, adjustment, reason })}
                            disabled={adjustMutation.isPending || adjustment === 0}
                            className="w-full py-2.5 bg-primary-orange text-white rounded-xl font-medium text-sm disabled:opacity-50"
                        >
                            {adjustMutation.isPending ? 'Saving...' : 'Apply Adjustment'}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left">
                            <th className="p-4 font-medium text-neutral-500">Product</th>
                            <th className="p-4 font-medium text-neutral-500 hidden md:table-cell">SKU</th>
                            <th className="p-4 font-medium text-neutral-500">Option</th>
                            <th className="p-4 font-medium text-neutral-500">Value</th>
                            <th className="p-4 font-medium text-neutral-500">Stock</th>
                            <th className="p-4 font-medium text-neutral-500">Status</th>
                            <th className="p-4 font-medium text-neutral-500 w-20">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 rounded-lg animate-pulse" /></td></tr>
                        )) : lowStock.length === 0 ? (
                            <tr><td colSpan={7} className="p-12 text-center">
                                <Warehouse className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                                <p className="text-emerald-600 font-medium">All stock levels healthy! 🎉</p>
                            </td></tr>
                        ) : lowStock.map((item: LowStockItem) => (
                            <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                <td className="p-4 font-medium">{item.product_name}</td>
                                <td className="p-4 text-neutral-500 hidden md:table-cell font-mono text-xs">{item.product_sku}</td>
                                <td className="p-4 text-neutral-500 capitalize">{item.option_name}</td>
                                <td className="p-4 text-neutral-500">{item.value}</td>
                                <td className="p-4">
                                    <span className={`font-bold ${item.stock_quantity <= 3 ? 'text-red-500' : 'text-amber-500'}`}>{item.stock_quantity}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${item.stock_quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => setAdjustModal({ valueId: item.id, name: `${item.product_name} — ${item.value}`, currentStock: item.stock_quantity })}
                                        className="px-3 py-1.5 rounded-lg bg-primary-orange/10 text-primary-orange text-xs font-medium hover:bg-primary-orange/20 transition-colors"
                                    >
                                        Adjust
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
