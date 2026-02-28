'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    // Fetch live products
    const { data, isLoading, error } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: () => api.getProducts({ limit: 100 }), // Fetching up to 100 for admin view
    });

    const products = data?.products || [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        }
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
                    <p className="text-neutral-400 text-sm mt-1">{products.length} total products</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Failed to load products. Please try again later.</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-orange mb-4" />
                            <p>Loading catalog...</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Product</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Category</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Price</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Stock</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Status</th>
                                    <th className="text-right font-medium text-neutral-400 px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                ) : filtered.map((product) => (
                                    <tr key={product.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                                                    <Image
                                                        src={product.images[0]?.url || '/images/placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{product.name}</span>
                                                    <span className="text-xs text-neutral-400 block lg:hidden">{product.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 hidden lg:table-cell">{product.category}</td>
                                        <td className="px-6 py-4 font-medium">${product.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={product.available < 10 ? 'text-red-500 font-medium' : ''}>
                                                {product.available}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors group" aria-label="Edit">
                                                    <Edit2 className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    disabled={deleteMutation.isPending}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
