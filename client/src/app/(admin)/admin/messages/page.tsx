'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    Mail, MailOpen, Reply, Trash2, Search, Filter,
    MoreVertical, Phone, Calendar,
    Loader2, CheckCircle2, Inbox,
    ChevronRight, Archive, Send
} from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: 'unread' | 'read' | 'replied' | 'archived';
    admin_reply?: string;
    replied_at?: string;
    created_at: string;
}

export default function AdminMessagesPage() {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-messages', selectedStatus, page],
        queryFn: () => api.getAdminMessages({
            status: selectedStatus || undefined,
            page,
            limit: 20
        }),
    });

    const { data: selectedMessage, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['admin-message-detail', selectedId],
        queryFn: async () => {
            if (!selectedId) return null;
            const res = await api.getAdminMessageDetail(selectedId);
            return res as ContactMessage;
        },
        enabled: !!selectedId,
    });

    // In React Query v5, side effects should be handled in useEffect or onSuccess of mutations
    useEffect(() => {
        if (selectedMessage?.status === 'unread') {
            queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
        }
    }, [selectedMessage?.status, queryClient]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
            setSelectedId(null);
        },
    });

    const replyMutation = useMutation({
        mutationFn: ({ id, reply }: { id: string, reply: string }) => api.replyToMessage(id, reply),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
            queryClient.invalidateQueries({ queryKey: ['admin-message-detail', selectedId] });
            setReplyText('');
        },
    });

    const messages = (data?.messages || []) as ContactMessage[];
    const statusFilters = [
        { label: 'All', value: null, icon: Inbox },
        { label: 'Unread', value: 'unread', icon: Mail },
        { label: 'Read', value: 'read', icon: MailOpen },
        { label: 'Replied', value: 'replied', icon: Send },
        { label: 'Archived', value: 'archived', icon: Archive },
    ];

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-1">Inquiries</h1>
                    <p className="text-sm font-medium text-neutral-500">Manage customer messages and support requests.</p>
                </div>

                <div className="flex p-1.5 bg-neutral-100 rounded-[20px] border border-neutral-200">
                    {statusFilters.map((f) => (
                        <button
                            key={f.label}
                            onClick={() => {
                                setSelectedStatus(f.value);
                                setPage(1);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedStatus === f.value
                                    ? 'bg-white text-primary-orange shadow-md shadow-neutral-200'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            <f.icon className="w-3.5 h-3.5" />
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* List View */}
                <div className="w-full md:w-[400px] flex flex-col bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-neutral-50 bg-neutral-50/50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                            <input
                                placeholder="Search sender..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
                                <p className="text-xs font-bold text-neutral-400">Fetching inbox...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
                                <Inbox className="w-12 h-12 mb-3 text-neutral-300" />
                                <p className="text-sm font-bold text-neutral-500">Your inbox is clear.</p>
                            </div>
                        ) : (
                            messages.map((msg: ContactMessage) => (
                                <button
                                    key={msg.id}
                                    onClick={() => setSelectedId(msg.id)}
                                    className={`w-full p-5 flex flex-col text-left transition-all hover:bg-neutral-50 relative group ${selectedId === msg.id ? 'bg-orange-50/30' : ''
                                        }`}
                                >
                                    {msg.status === 'unread' && (
                                        <div className="absolute top-6 left-1.5 w-1.5 h-1.5 bg-primary-orange rounded-full animate-pulse shadow-sm" />
                                    )}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className={`text-sm font-black truncate max-w-[150px] ${msg.status === 'unread' ? 'text-neutral-900' : 'text-neutral-600'}`}>
                                            {msg.name}
                                        </h4>
                                        <span className="text-[10px] font-black text-neutral-400 tabular-nums">
                                            {format(new Date(msg.created_at), 'MMM dd')}
                                        </span>
                                    </div>
                                    <p className={`text-xs font-bold truncate mb-2 ${msg.status === 'unread' ? 'text-neutral-700' : 'text-neutral-500'}`}>
                                        {msg.subject || 'No Subject'}
                                    </p>
                                    <p className="text-[11px] font-medium text-neutral-400 line-clamp-1 opacity-80 italic">
                                        {msg.message}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${msg.status === 'unread' ? 'bg-amber-100 text-amber-700' :
                                                msg.status === 'replied' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-neutral-100 text-neutral-500'
                                            }`}>
                                            {msg.status}
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform group-hover:translate-x-1 ${selectedId === msg.id ? 'translate-x-1 text-primary-orange' : ''}`} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col relative">
                    {!selectedId ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-neutral-50 rounded-[40px] flex items-center justify-center text-neutral-200 mb-6 border border-neutral-100/50">
                                <Mail className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-neutral-900 mb-2">Select a message</h3>
                            <p className="text-neutral-500 max-w-xs font-medium">Choose a customer inquiry from the left to view the full details and respond.</p>
                        </div>
                    ) : isLoadingDetail ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary-orange opacity-20" />
                            <p className="text-sm font-black text-neutral-300 animate-pulse">Deep scanning inquiry...</p>
                        </div>
                    ) : selectedMessage && (
                        <>
                            <div className="p-8 border-b border-neutral-50 bg-white sticky top-0 z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/50 flex items-center justify-center text-neutral-400 font-black text-2xl shadow-inner">
                                            {selectedMessage.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-neutral-900 leading-tight mb-1">{selectedMessage.name}</h3>
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <a href={`mailto:${selectedMessage.email}`} className="text-sm font-bold hover:text-primary-orange transition-colors flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" /> {selectedMessage.email}
                                                </a>
                                                {selectedMessage.phone && (
                                                    <a href={`tel:${selectedMessage.phone}`} className="text-sm font-bold hover:text-primary-orange transition-colors flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                                                        <Phone className="w-3.5 h-3.5" /> {selectedMessage.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (confirm('Permanently delete this inquiry?')) deleteMutation.mutate(selectedMessage.id);
                                            }}
                                            className="p-3 text-neutral-400 border border-neutral-100 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            title="Delete Message"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 text-neutral-400 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-3 px-5 bg-neutral-50 rounded-2xl border border-neutral-100/50">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Subject Matter</span>
                                        <p className="font-black text-neutral-800 text-sm">{selectedMessage.subject || 'No Subject Provided'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Received On</span>
                                        <p className="font-bold text-neutral-600 text-sm tabular-nums">{format(new Date(selectedMessage.created_at), 'MMMM dd, yyyy • h:mm a')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-neutral-50/20">
                                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm relative">
                                    <div className="absolute -top-3 left-10 px-3 py-1 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Customer Inquiry</div>
                                    <p className="text-lg font-medium text-neutral-700 leading-relaxed italic opacity-90">
                                        "{selectedMessage.message}"
                                    </p>
                                </div>

                                {selectedMessage.admin_reply && (
                                    <div className="pl-12 space-y-4">
                                        <div className="p-8 bg-neutral-900 text-white border border-neutral-800 rounded-[32px] shadow-xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="absolute -top-3 right-10 px-3 py-1 bg-primary-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full">Official Response</div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <Send className="w-5 h-5 text-primary-orange" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-medium opacity-90 leading-relaxed mb-4">{selectedMessage.admin_reply}</p>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 tabular-nums">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        Sent {selectedMessage.replied_at ? format(new Date(selectedMessage.replied_at), 'MMM dd, h:mm a') : 'Recently'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Always show reply composer */}
                                <div className="p-8 bg-white border-2 border-dashed border-neutral-100 rounded-[32px] space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-primary-orange/10 rounded-lg text-primary-orange"><Reply className="w-4 h-4" /></div>
                                        <h4 className="font-black text-neutral-900 uppercase text-xs tracking-widest">
                                            {selectedMessage.admin_reply ? 'Send Follow-up Reply' : 'Compose Response'}
                                        </h4>
                                    </div>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={selectedMessage.admin_reply ? "Write a follow-up reply..." : "Type your reply to the customer..."}
                                        className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/20 transition-all font-medium text-neutral-700 min-h-[200px] resize-none"
                                    />
                                    <button
                                        onClick={() => replyMutation.mutate({ id: selectedMessage.id, reply: replyText })}
                                        disabled={!replyText || replyMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-4 bg-primary-orange text-white rounded-2xl text-sm font-black hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-orange/20 ml-auto"
                                    >
                                        {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
                                    </button>
                                    <p className="text-[10px] font-bold text-neutral-400 text-center uppercase tracking-widest">
                                        Replies will be stored and marked as sent in-app
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
