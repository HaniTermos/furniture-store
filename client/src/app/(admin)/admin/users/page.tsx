'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, ShieldAlert, Loader2, UserCheck, Shield, User } from 'lucide-react';

export default function UsersManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: usersData, isLoading, error } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: () => api.getUsers(),
    });

    const users = usersData?.users || [];

    const roleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string, role: string }) => api.updateUserRole(id, role as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string, is_active: boolean }) => api.updateUserStatus(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });

    const filtered = users.filter((u: any) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = (id: string, newRole: string) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            roleMutation.mutate({ id, role: newRole });
        }
    };

    const handleStatusToggle = (id: string, currentStatus: boolean) => {
        statusMutation.mutate({ id, is_active: !currentStatus });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Staff & Users</h1>
                    <p className="text-neutral-400 text-sm mt-1">Manage system accessibility and staff roles.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p>Failed to load user records. You may not have administrative privileges.</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-orange mb-4" />
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">User</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Email Address</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Role</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Status</th>
                                    <th className="text-left font-medium text-neutral-400 px-6 py-3">Joined Date</th>
                                    <th className="text-right font-medium text-neutral-400 px-6 py-3">Manage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : filtered.map((user: any) => (
                                    <tr key={user.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-orange/10 text-primary-orange flex items-center justify-center flex-shrink-0 font-bold">
                                                    {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                                                </div>
                                                <span className="font-medium">{user.first_name} {user.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <Shield className="w-4 h-4 text-purple-500" />
                                                ) : user.role === 'manager' ? (
                                                    <UserCheck className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <User className="w-4 h-4 text-neutral-400" />
                                                )}
                                                <span className={`font-medium capitalize ${user.role === 'admin' ? 'text-purple-600' :
                                                        user.role === 'manager' ? 'text-blue-600' : 'text-neutral-600'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                disabled={statusMutation.isPending && statusMutation.variables?.id === user.id}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${user.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer'
                                                    } ${statusMutation.isPending ? 'opacity-50' : ''}`}
                                            >
                                                {user.is_active ? 'Active' : 'Suspended'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={roleMutation.isPending && roleMutation.variables?.id === user.id}
                                                className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-neutral-50 outline-none focus:border-primary-orange disabled:opacity-50"
                                            >
                                                <option value="customer">Customer Role</option>
                                                <option value="manager">Manager Role</option>
                                                <option value="admin">Admin Role</option>
                                            </select>
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
