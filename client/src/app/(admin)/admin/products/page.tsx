'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    Search, Plus, MoreVertical, Trash2, Copy, Edit, Eye, ChevronLeft, ChevronRight,
    Filter, Package, Download, AlertTriangle
} from 'lucide-react';

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-neutral-100 text-neutral-600',
    featured: 'bg-amber-100 text-amber-700',
};

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const [selected, setSelected] = useState<string[]>([]);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [fadingIds, setFadingIds] = useState<string[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', page, search, status],
        queryFn: () => api.getAdminProducts({ page, limit: 20, search, ...(status && { status }) }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.adminDeleteProduct(id),
        onSuccess: (_data, id) => {
            setFadingIds(prev => [...prev, id]);
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                setFadingIds(prev => prev.filter(fid => fid !== id));
            }, 400);
            setOpenMenu(null);
            setDeleteTarget(null);
            toast.success('Product deleted successfully');
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to delete product');
        },
    });

    const duplicateMutation = useMutation({
        mutationFn: (id: string) => api.adminDuplicateProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            setOpenMenu(null);
            toast.success('Product duplicated');
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: string[]) => api.adminBulkDeleteProducts(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            setSelected([]);
            toast.success('Selected products deleted');
        },
    });

    const products = data?.products || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 20);
    const allSelected = products.length > 0 && selected.length === products.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-sm text-neutral-500">{total} total products</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/export/products`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-medium text-sm hover:bg-neutral-50 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-orange text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-primary-orange/25"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['', 'active', 'inactive', 'featured'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1); }}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${status === s
                                ? 'bg-primary-orange text-white border-primary-orange'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-primary-orange/5 border border-primary-orange/20 rounded-xl">
                    <span className="text-sm font-medium">{selected.length} selected</span>
                    <button
                        onClick={() => {
                            if (confirm(`Delete ${selected.length} selected products?`)) {
                                bulkDeleteMutation.mutate(selected);
                            }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Delete Selected
                    </button>
                    <button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-neutral-700">Clear</button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => setSelected(e.target.checked ? products.map((p: any) => p.id) : [])}
                                    className="rounded border-neutral-300 accent-primary-orange"
                                />
                            </th>
                            <th className="p-4 font-medium text-neutral-500">Product</th>
                            <th className="p-4 font-medium text-neutral-500 hidden md:table-cell">SKU</th>
                            <th className="p-4 font-medium text-neutral-500">Price</th>
                            <th className="p-4 font-medium text-neutral-500 hidden lg:table-cell">Category</th>
                            <th className="p-4 font-medium text-neutral-500">Status</th>
                            <th className="p-4 font-medium text-neutral-500 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 rounded-lg animate-pulse" /></td></tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500 font-medium">No products found</p>
                                    <p className="text-neutral-400 text-xs mt-1">Try adjusting your filters</p>
                                </td>
                            </tr>
                        ) : (
                            products.map((product: any) => (
                                <tr key={product.id} className={`border-b border-neutral-50 hover:bg-neutral-50/50 transition-all ${fadingIds.includes(product.id) ? 'opacity-0 translate-x-4 transition-all duration-400' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(product.id)}
                                            onChange={(e) => setSelected(e.target.checked ? [...selected, product.id] : selected.filter(id => id !== product.id))}
                                            className="rounded border-neutral-300 accent-primary-orange"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.primary_image ? (
                                                <img src={product.primary_image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-neutral-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                                                {product.is_featured && <span className="text-[10px] font-semibold text-amber-600 uppercase">Featured</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-neutral-500 hidden md:table-cell font-mono text-xs">{product.sku}</td>
                                    <td className="p-4 font-medium">${Number(product.base_price).toFixed(2)}</td>
                                    <td className="p-4 text-neutral-500 hidden lg:table-cell">{product.category_name || '—'}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? statusColors.active : statusColors.inactive
                                            }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 relative">
                                        <button
                                            onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                                            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-neutral-400" />
                                        </button>
                                        {openMenu === product.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                                                <div className="absolute right-0 top-full z-50 w-44 rounded-xl shadow-xl border bg-white overflow-hidden">
                                                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setOpenMenu(null)}>
                                                        <Eye className="w-4 h-4" /> View
                                                    </Link>
                                                    <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setOpenMenu(null)}>
                                                        <Edit className="w-4 h-4" /> Edit
                                                    </Link>
                                                    <button onClick={() => duplicateMutation.mutate(product.id)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 w-full text-left">
                                                        <Copy className="w-4 h-4" /> Duplicate
                                                    </button>
                                                    <button onClick={() => { setDeleteTarget({ id: product.id, name: product.name }); setOpenMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 w-full text-left text-red-500">
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
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
                    <p className="text-xs text-neutral-500">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= totalPages).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page
                                    ? 'bg-primary-orange text-white'
                                    : 'border border-neutral-200 hover:bg-neutral-50'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Delete Product</h3>
                                <p className="text-sm text-neutral-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-6">
                            Are you sure you want to delete <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>? The product will be permanently removed from your store.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                                disabled={deleteMutation.isPending}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
