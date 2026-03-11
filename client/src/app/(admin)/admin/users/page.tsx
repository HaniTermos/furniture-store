'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Filter, CheckCircle2, XCircle, MoreVertical, Mail, UserPlus, Shield } from 'lucide-react';
import type { User } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invitationStatus, setInvitationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [inviteData, setInviteData] = useState({ email: '', name: '', role: 'user' });
    const [inviteError, setInviteError] = useState<string | null>(null);
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

    const filtered = users.filter((u: User) =>
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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInvitationStatus('loading');
        setInviteError(null);

        try {
            await api.inviteUser(inviteData);
            setInvitationStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setInvitationStatus('idle');
                setInviteData({ email: '', name: '', role: 'user' });
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            }, 2000);
        } catch (err: unknown) {
            setInviteError((err as Error).message || 'Failed to send invitation.');
            setInvitationStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Staff & Users</h1>
                    <p className="text-neutral-400 text-sm mt-1">Manage system accessibility and staff roles.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
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
                                ) : filtered.map((user: User) => (
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

            {/* Invite User Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                                <h3 className="text-xl font-bold">Invite New User</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            <div className="p-6">
                                {invitationStatus === 'success' ? (
                                    <div className="py-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-lg font-bold">Invitation Sent!</h4>
                                        <p className="text-neutral-500">The user will receive an email to complete their registration.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInvite} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-700">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={inviteData.name}
                                                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-700">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={inviteData.email}
                                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                                    placeholder="john@example.com"
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-700">System Role</label>
                                            <select
                                                required
                                                value={inviteData.role}
                                                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange transition-all"
                                            >
                                                <option value="user">Customer</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                            <p className="text-[10px] text-neutral-400 mt-1">
                                                Managers can manage products and orders. Admins have full system control.
                                            </p>
                                        </div>

                                        {inviteError && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100 flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" />
                                                {inviteError}
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4 border-t border-neutral-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 btn-outline"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={invitationStatus === 'loading'}
                                                className="flex-1 btn-primary"
                                            >
                                                {invitationStatus === 'loading' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : 'Send Invite'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
