'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import {
    Activity, Users, Package, ShoppingCart, Star, Settings, Clock,
    ChevronLeft, ChevronRight,
} from 'lucide-react';

export interface ActivityLog {
    id: string;
    action: string;
    user_name?: string;
    user_email?: string;
    entity_type?: string;
    new_values?: Record<string, unknown>;
    created_at: string;
    ip_address?: string;
}

const actionIcons: Record<string, React.ElementType> = {
    login: Users, register: Users, logout: Users, verify_email: Users,
    google_login: Users, password_reset: Users, password_change: Users,
    create_product: Package, update_product: Package, delete_product: Package,
    create_category: Package, update_category: Package,
    update_order_status: ShoppingCart,
    update_customer: Users,
    create_coupon: Star, adjust_stock: Settings,
    update_role: Users,
};

const actionColors: Record<string, string> = {
    login: 'bg-blue-100 text-blue-600', register: 'bg-emerald-100 text-emerald-600',
    logout: 'bg-neutral-100 text-neutral-600', delete_product: 'bg-red-100 text-red-600',
    update_order_status: 'bg-purple-100 text-purple-600', create_product: 'bg-emerald-100 text-emerald-600',
    adjust_stock: 'bg-amber-100 text-amber-600', create_coupon: 'bg-pink-100 text-pink-600',
    update_role: 'bg-indigo-100 text-indigo-600',
};

export default function AdminActivityPage() {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-activity', page, actionFilter],
        queryFn: () => api.getAdminActivityLogs({ page, limit: 30, ...(actionFilter && { action: actionFilter }) }),
    });

    const logs = data?.logs || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 30);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
                <p className="text-sm text-neutral-500">Audit trail of all admin actions</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['', 'login', 'register', 'create_product', 'update_product', 'update_order_status', 'adjust_stock', 'create_coupon'].map((a) => (
                    <button
                        key={a}
                        onClick={() => { setActionFilter(a); setPage(1); }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${actionFilter === a
                            ? 'bg-primary-orange text-white border-primary-orange'
                            : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                            }`}
                    >
                        {a === '' ? 'All' : a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
                )) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-medium">No activity found</p>
                    </div>
                ) : logs.map((log: ActivityLog) => {
                    const Icon = actionIcons[log.action] || Clock;
                    const colorClass = actionColors[log.action] || 'bg-neutral-100 text-neutral-600';
                    return (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 bg-white hover:shadow-sm transition-all">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">{log.user_name || log.user_email || 'System'}</span>{' '}
                                    <span className="text-neutral-500">{log.action?.replace(/_/g, ' ')}</span>
                                    {log.entity_type && <span className="text-neutral-400"> · {log.entity_type}</span>}
                                </p>
                                {log.new_values && (
                                    <p className="text-xs text-neutral-400 mt-1 font-mono truncate max-w-md">
                                        {JSON.stringify(log.new_values).slice(0, 100)}
                                    </p>
                                )}
                                <p className="text-[11px] text-neutral-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                            </div>
                            {log.ip_address && (
                                <span className="text-[10px] text-neutral-400 font-mono hidden xl:block">{log.ip_address}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
