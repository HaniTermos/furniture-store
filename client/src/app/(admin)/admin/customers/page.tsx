'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronLeft, ChevronRight, Eye, Mail, Download } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    email_verified: boolean;
}

export default function AdminCustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-customers', page, search],
        queryFn: () => api.getAdminCustomers({ page, limit: 20, search }),
    });

    const customers = data?.users || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 20);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-sm text-neutral-500">{total} registered customers</p>
                </div>
                <button
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/export/customers`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
                    ))
                    : customers.length === 0
                        ? (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-500 font-medium">No customers found</p>
                            </div>
                        )
                        : customers.map((c: Customer) => (
                            <div key={c.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 bg-white hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">{c.name}</p>
                                    <p className="text-xs text-neutral-400 truncate">{c.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        {c.email_verified && (
                                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/admin/customers/${c.id}`} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <Eye className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= totalPages).map((p) => (
                            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-orange text-white' : 'border border-neutral-200'}`}>{p}</button>
                        ))}
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
