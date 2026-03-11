'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Plus, Tag, Edit, Trash2, Search, X } from 'lucide-react';

interface CouponData {
    code: string; type: string; value: number;
    min_purchase?: number; usage_limit?: number | null; per_customer_limit?: number;
    starts_at?: string | null; expires_at?: string | null;
}
interface Coupon extends Omit<CouponData, 'value' | 'min_purchase' | 'usage_limit' | 'per_customer_limit'> {
    id: string; value: string | number; min_purchase: string | number; usage_limit: string | number; per_customer_limit: string | number;
    is_active: boolean; usage_count: number;
}

export default function AdminCouponsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_purchase: '0', usage_limit: '', per_customer_limit: '1', starts_at: '', expires_at: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-coupons', search],
        queryFn: () => api.getAdminCoupons({ search }),
    });

    const createMutation = useMutation({
        mutationFn: (data: CouponData) => editId ? api.updateCoupon(editId, data) : api.createCoupon(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); resetForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteCoupon(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
    });

    const resetForm = () => {
        setShowForm(false); setEditId(null);
        setForm({ code: '', type: 'percentage', value: '', min_purchase: '0', usage_limit: '', per_customer_limit: '1', starts_at: '', expires_at: '' });
    };

    const handleEdit = (coupon: Coupon) => {
        setEditId(coupon.id);
        setForm({
            code: coupon.code, type: coupon.type, value: String(coupon.value), min_purchase: String(coupon.min_purchase) || '0',
            usage_limit: String(coupon.usage_limit) || '', per_customer_limit: String(coupon.per_customer_limit) || '1',
            starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : '',
            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
        });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-sm text-neutral-500">{data?.total || 0} coupons</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-orange text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-primary-orange/25">
                    <Plus className="w-4 h-4" /> New Coupon
                </button>
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{editId ? 'Edit' : 'Create'} Coupon</h2>
                            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-neutral-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Code</label>
                                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-mono" placeholder="SUMMER20" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm">
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="shipping">Free Shipping</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Value</label>
                                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" placeholder={form.type === 'percentage' ? '20' : '50'} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Min Purchase ($)</label>
                                <input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Usage Limit</label>
                                <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" placeholder="Unlimited" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Starts At</label>
                                <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Expires At</label>
                                <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                        </div>
                        <button
                            onClick={() => createMutation.mutate({ ...form, value: parseFloat(form.value), min_purchase: parseFloat(form.min_purchase || '0'), usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null, per_customer_limit: parseInt(form.per_customer_limit || '1'), starts_at: form.starts_at || null, expires_at: form.expires_at || null })}
                            disabled={createMutation.isPending}
                            className="w-full py-2.5 bg-primary-orange text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Saving...' : editId ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupons..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-orange/20 outline-none" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left">
                            <th className="p-4 font-medium text-neutral-500">Code</th>
                            <th className="p-4 font-medium text-neutral-500">Discount</th>
                            <th className="p-4 font-medium text-neutral-500 hidden md:table-cell">Min. Purchase</th>
                            <th className="p-4 font-medium text-neutral-500 hidden md:table-cell">Usage</th>
                            <th className="p-4 font-medium text-neutral-500 hidden lg:table-cell">Expires</th>
                            <th className="p-4 font-medium text-neutral-500">Status</th>
                            <th className="p-4 font-medium text-neutral-500 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 rounded-lg animate-pulse" /></td></tr>
                        )) : (data?.coupons || []).length === 0 ? (
                            <tr><td colSpan={7} className="p-12 text-center"><Tag className="w-12 h-12 text-neutral-300 mx-auto mb-3" /><p className="text-neutral-500">No coupons yet</p></td></tr>
                        ) : (data?.coupons || []).map((c: Coupon) => (
                            <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                <td className="p-4 font-mono font-bold text-primary-orange">{c.code}</td>
                                <td className="p-4 font-medium">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `$${c.value}` : 'Free Shipping'}</td>
                                <td className="p-4 text-neutral-500 hidden md:table-cell">{Number(c.min_purchase) > 0 ? `$${c.min_purchase}` : '—'}</td>
                                <td className="p-4 text-neutral-500 hidden md:table-cell">{c.usage_count}/{c.usage_limit || '∞'}</td>
                                <td className="p-4 text-neutral-500 hidden lg:table-cell text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                        {c.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-1">
                                    <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
