'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Settings, Globe, Truck, CreditCard, Users, Shield, Mail, Save, Plus, UserCog, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { toast } from 'react-hot-toast'; // Assuming toast is available or I can use alert

function SettingsSection({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-neutral-100">
                <div className="p-2 rounded-xl bg-primary-orange/10 text-primary-orange"><Icon className="w-5 h-5" /></div>
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-xs text-neutral-500">{description}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const { user } = useAppStore();
    const [activeTab, setActiveTab] = useState('general');
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);

    const { data: staffData } = useQuery({
        queryKey: ['admin-staff'],
        queryFn: () => api.getAdminStaff(),
        enabled: activeTab === 'staff',
    });

    const { data: settingsData } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => api.getSettings(),
    });

    const updateSettingMutation = useMutation({
        mutationFn: ({ key, value }: { key: string; value: any }) => api.updateSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success('Setting saved');
        },
        onError: () => toast.error('Failed to save setting'),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) => api.updateStaffRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
            toast.success('Role updated');
        },
    });

    const inviteStaffMutation = useMutation({
        mutationFn: (data: { email: string; name: string; role: string }) => api.inviteUser(data),
        onSuccess: () => {
            setShowAddStaffModal(false);
            toast.success('Invitation sent successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to send invitation'),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => api.toggleStaffStatus(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
            toast.success('Status updated');
        },
    });

    const deleteStaffMutation = useMutation({
        mutationFn: (id: string) => api.deleteStaff(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
            toast.success('Member removed');
        },
    });

    const { data: currenciesData } = useQuery({
        queryKey: ['admin-currencies'],
        queryFn: () => api.getCurrencies(),
    });

    const createCurrencyMutation = useMutation({
        mutationFn: (data: any) => api.createCurrency(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency added');
        },
    });

    const updateCurrencyMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateCurrency(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency updated');
        },
    });

    const deleteCurrencyMutation = useMutation({
        mutationFn: (id: string) => api.deleteCurrency(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency removed');
        },
    });

    const tabs = [
        { key: 'general', label: 'General', icon: Settings },
        { key: 'staff', label: 'Staff & Roles', icon: Users },
        { key: 'currencies', label: 'Currencies', icon: Globe },
        { key: 'shipping', label: 'Shipping', icon: Truck },
        { key: 'payments', label: 'Payments', icon: CreditCard },
        { key: 'email', label: 'Email', icon: Mail },
        { key: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-neutral-500">Manage your store configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* General */}
            {activeTab === 'general' && (
                <SettingsSection title="Store Information" description="Basic store details" icon={Globe}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateSettingMutation.mutate({ key: 'store_info', value: Object.fromEntries(formData) });
                    }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Store Name</label>
                                <input name="name" defaultValue={settingsData?.store_info?.name || 'HTW Furniture'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Store URL</label>
                                <input name="url" defaultValue={settingsData?.store_info?.url || 'https://htwfurniture.com'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Support Email</label>
                                <input name="email" defaultValue={settingsData?.store_info?.email || 'support@htwfurniture.com'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
                                <input name="phone" defaultValue={settingsData?.store_info?.phone || '+1 (555) 000-0000'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Address</label>
                                <textarea name="address" rows={2} defaultValue={settingsData?.store_info?.address || '123 Furniture Lane, Design District'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm resize-none" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updateSettingMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </SettingsSection>
            )}

            {/* Staff & Roles */}
            {activeTab === 'staff' && (
                <div className="space-y-6">
                    <SettingsSection title="Staff Management" description="Manage admin team members and their roles" icon={UserCog}>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowAddStaffModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-primary-orange/20"
                            >
                                <Plus className="w-4 h-4" /> Invite Team Member
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(staffData?.staff || []).map((member: { id: string; name: string; email: string; role: string; last_login?: string; status?: string; is_active?: boolean }) => (
                                <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-neutral-400">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={member.role}
                                            disabled={updateRoleMutation.isPending || user?.role !== 'super_admin'}
                                            onChange={(e) => updateRoleMutation.mutate({ id: member.id, role: e.target.value })}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="user">User</option>
                                        </select>
                                        <button
                                            onClick={() => toggleStatusMutation.mutate({ id: member.id, is_active: !member.is_active })}
                                            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase transition-all ${member.is_active
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            {member.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        {user?.role === 'super_admin' && member.id !== user.id && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to remove this team member?')) {
                                                        deleteStaffMutation.mutate(member.id);
                                                    }
                                                }}
                                                className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!staffData?.staff || staffData.staff.length === 0) && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                                    <p className="text-sm text-neutral-400">No staff members found</p>
                                </div>
                            )}
                        </div>
                    </SettingsSection>
                </div>
            )}

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddStaffModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-lg font-bold">Invite Team Member</h3>
                            <p className="text-xs text-neutral-500">Send an invitation email to join the admin team</p>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            inviteStaffMutation.mutate({
                                name: formData.get('name') as string,
                                email: formData.get('email') as string,
                                role: formData.get('role') as string,
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Full Name</label>
                                <input name="name" required className="w-full px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Email Address</label>
                                <input name="email" type="email" required className="w-full px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">System Role</label>
                                <select name="role" required className="w-full px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm appearance-none">
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                                    An email will be sent to the user with a secure link to set up their account and password. The link will expire in 48 hours.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddStaffModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteStaffMutation.isPending}
                                    className="flex-1 px-4 py-2 rounded-xl bg-primary-orange text-white text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-primary-orange/20 disabled:opacity-50"
                                >
                                    {inviteStaffMutation.isPending ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Currencies */}
            {activeTab === 'currencies' && (
                <div className="space-y-6">
                    <SettingsSection title="Currency Management" description="Manage store currencies and exchange rates" icon={Globe}>
                        <div className="space-y-4">
                            {(currenciesData || []).map((curr: any) => (
                                <div key={curr.id} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 bg-white">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600">
                                        {curr.symbol}
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase">Code</p>
                                            <p className="font-medium text-sm">{curr.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase">Exchange Rate</p>
                                            <input
                                                type="number"
                                                step="0.000001"
                                                defaultValue={curr.exchange_rate}
                                                disabled={curr.is_base}
                                                onBlur={(e) => {
                                                    const rate = parseFloat(e.target.value);
                                                    if (rate !== parseFloat(curr.exchange_rate)) {
                                                        updateCurrencyMutation.mutate({ id: curr.id, data: { exchange_rate: rate } });
                                                    }
                                                }}
                                                className="w-full bg-transparent font-medium text-sm outline-none focus:text-primary-orange disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase">Status</p>
                                            <button
                                                onClick={() => updateCurrencyMutation.mutate({ id: curr.id, data: { is_active: !curr.is_active } })}
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${curr.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                                            >
                                                {curr.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            {curr.is_base ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase">Base</span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => updateCurrencyMutation.mutate({ id: curr.id, data: { is_base: true } })}
                                                        className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold uppercase hover:bg-primary-orange/10 hover:text-primary-orange transition-colors"
                                                        title="Set as base currency"
                                                    >
                                                        Set as Base
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this currency?')) {
                                                                deleteCurrencyMutation.mutate(curr.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Currency Form */}
                            <div className="p-4 rounded-xl border-2 border-dashed border-neutral-100">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    createCurrencyMutation.mutate(Object.fromEntries(formData));
                                    (e.target as HTMLFormElement).reset();
                                }} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Code</label>
                                        <input name="code" placeholder="EUR" className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Name</label>
                                        <input name="name" placeholder="Euro" className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Symbol</label>
                                        <input name="symbol" placeholder="€" className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Rate</label>
                                        <input name="exchange_rate" type="number" step="0.000001" placeholder="0.92" className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" required />
                                    </div>
                                    <button type="submit" className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
                                        Add
                                    </button>
                                </form>
                            </div>
                        </div>
                    </SettingsSection>
                </div>
            )}
            {activeTab === 'shipping' && (
                <SettingsSection title="Shipping Settings" description="Configure shipping zones and rates" icon={Truck}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const value = {
                            free_threshold: parseFloat(formData.get('free_threshold') as string),
                            default_rate: parseFloat(formData.get('default_rate') as string)
                        };
                        updateSettingMutation.mutate({ key: 'shipping', value });
                    }} className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-sm text-blue-700">Shipping configuration can be extended with zone-based rates, free shipping thresholds, and carrier integrations.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Free Shipping Threshold ($)</label>
                                <input name="free_threshold" type="number" step="0.01" defaultValue={settingsData?.shipping?.free_threshold || '100'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Default Shipping Rate ($)</label>
                                <input name="default_rate" type="number" step="0.01" defaultValue={settingsData?.shipping?.default_rate || '9.99'} className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updateSettingMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </SettingsSection>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
                <SettingsSection title="Payment Settings" description="Configure payment gateways" icon={CreditCard}>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-700">
                            To enable Stripe payments, add your <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> and <code className="bg-amber-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> to the server <code>.env</code> file.
                        </p>
                    </div>
                </SettingsSection>
            )}

            {/* Email */}
            {activeTab === 'email' && (
                <SettingsSection title="Email Configuration" description="SMTP and email template settings" icon={Mail}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">SMTP Host</label>
                            <input placeholder="smtp.gmail.com" className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">SMTP Port</label>
                            <input placeholder="587" className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">From Name</label>
                            <input placeholder="HTW Furniture" className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">From Email</label>
                            <input placeholder="noreply@htwfurniture.com" className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm" />
                        </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-3">Email credentials are stored in server environment variables. This interface provides visibility only.</p>
                </SettingsSection>
            )}

            {/* Security */}
            {activeTab === 'security' && (
                <SettingsSection title="Security Settings" description="Authentication and security configuration" icon={Shield}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                            <div>
                                <p className="font-medium text-sm">Account Lockout</p>
                                <p className="text-xs text-neutral-500">Lock accounts after 5 failed login attempts for 15 minutes</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                            <div>
                                <p className="font-medium text-sm">Email Verification</p>
                                <p className="text-xs text-neutral-500">Require email verification for new registrations</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                            <div>
                                <p className="font-medium text-sm">Google OAuth</p>
                                <p className="text-xs text-neutral-500">Allow sign-in with Google accounts</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Requires Config</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                            <div>
                                <p className="font-medium text-sm">Rate Limiting</p>
                                <p className="text-xs text-neutral-500">100 requests/15min (API), 5 attempts/15min (Auth)</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100">
                            <div>
                                <p className="font-medium text-sm">Two-Factor Authentication</p>
                                <p className="text-xs text-neutral-500">TOTP-based 2FA for admin accounts</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">Coming Soon</span>
                        </div>
                    </div>
                </SettingsSection>
            )}
        </div>
    );
}
