'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    Star, CheckCircle2, MessageSquare, Trash2, ShieldCheck,
    ShieldAlert, Search, Filter, Reply, Heart, AlertCircle, Loader2,
    Calendar, User, Package
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReviewsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [search, setSearch] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-reviews', filter],
        queryFn: () => api.getAdminReviews({
            is_approved: filter === 'all' ? undefined : filter === 'approved'
        }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => api.approveReview(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteReview(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
    });

    const featuredMutation = useMutation({
        mutationFn: (id: string) => api.toggleReviewFeatured(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
    });

    const replyMutation = useMutation({
        mutationFn: ({ id, reply }: { id: string, reply: string }) => api.replyToReview(id, reply),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            setReplyingTo(null);
            setReplyText('');
        },
    });

    const reviews = data?.reviews || [];
    const filteredReviews = reviews.filter((r: any) =>
        r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-2">Review Command</h1>
                    <p className="text-neutral-500 font-medium">Moderate customer feedback and build social proof.</p>
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
                    {(['all', 'pending', 'approved'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${filter === t
                                    ? 'bg-white text-primary-orange shadow-md'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-orange transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by customer, product, or content..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-100 rounded-[24px] shadow-sm outline-none focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/20 transition-all font-medium"
                    />
                </div>
                <div className="bg-white border border-neutral-100 p-4 rounded-[24px] shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Filtered</span>
                        <span className="text-2xl font-black text-neutral-900">{filteredReviews.length}</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-2xl text-neutral-400"><Filter className="w-5 h-5" /></div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-neutral-400 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-orange" />
                    <p className="font-bold animate-pulse">Scanning the feedback loop...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredReviews.map((review: any) => (
                        <div
                            key={review.id}
                            className={`p-8 bg-white border rounded-[32px] shadow-sm transition-all relative overflow-hidden group ${!review.is_approved ? 'border-amber-100 bg-amber-50/10' : 'border-neutral-100'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                {/* Left Side: User & Product */}
                                <div className="md:w-64 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-lg overflow-hidden border border-neutral-200">
                                            {review.user_avatar ? <img src={review.user_avatar} alt="" className="w-full h-full object-cover" /> : review.user_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-neutral-900 text-sm leading-tight">{review.user_name}</h4>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{review.is_verified_purchase ? 'Verified Buyer' : 'Customer'}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-2 mb-1 text-[10px] font-black text-neutral-400 uppercase">
                                            <Package className="w-3 h-3" /> Product
                                        </div>
                                        <p className="text-xs font-bold text-neutral-700 truncate">{review.product_name}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-bold uppercase tracking-tighter">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                    </div>
                                </div>

                                {/* Center: Review Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            {renderStars(review.rating)}
                                            <h3 className="text-lg font-black text-neutral-900">{review.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => featuredMutation.mutate(review.id)}
                                                className={`p-2.5 rounded-xl border transition-all ${review.is_featured
                                                        ? 'bg-primary-orange text-white border-primary-orange shadow-lg shadow-primary-orange/20'
                                                        : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-200'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${review.is_featured ? 'fill-white' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-neutral-600 leading-relaxed font-medium capitalize-first italic">"{review.comment}"</p>

                                    {/* Admin Reply */}
                                    {review.admin_reply && (
                                        <div className="mt-6 p-5 bg-neutral-900 text-white rounded-[24px] relative">
                                            <div className="absolute -top-2 left-6 w-4 h-4 bg-neutral-900 rotate-45" />
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck className="w-4 h-4 text-primary-orange flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">Official Response</p>
                                                    <p className="text-sm font-medium opacity-90 leading-relaxed">{review.admin_reply}</p>
                                                    <p className="text-[10px] font-bold text-neutral-500 mt-2">{format(new Date(review.admin_reply_at), 'MMM dd, h:mm a')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reply Textarea */}
                                    {replyingTo === review.id ? (
                                        <div className="mt-4 space-y-3">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a thoughtful response..."
                                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange/30 transition-all font-medium text-sm min-h-[100px] resize-none"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => replyMutation.mutate({ id: review.id, reply: replyText })}
                                                    disabled={replyMutation.isPending || !replyText}
                                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all"
                                                >
                                                    {replyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Reply className="w-3 h-3" />} Post Reply
                                                </button>
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-4 py-2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : !review.admin_reply && (
                                        <button
                                            onClick={() => setReplyingTo(review.id)}
                                            className="mt-2 flex items-center gap-1.5 text-xs font-black text-primary-orange hover:underline uppercase tracking-wider"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
                                        </button>
                                    )}
                                </div>

                                {/* Right Side: General Actions */}
                                <div className="md:w-40 flex flex-row md:flex-col gap-2">
                                    {!review.is_approved ? (
                                        <button
                                            onClick={() => approveMutation.mutate(review.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                        </button>
                                    ) : (
                                        <div className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase text-center border border-emerald-100 flex items-center justify-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4" /> Visible
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (confirm('Permanently delete this review?')) deleteMutation.mutate(review.id);
                                        }}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors border border-red-100"
                                    >
                                        <Trash2 className="w-5 h-5 mx-auto" />
                                    </button>
                                </div>
                            </div>

                            {/* Status Indicators */}
                            {!review.is_approved && (
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-bl-2xl border-l border-b border-amber-200 shadow-sm flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Moderation Required
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredReviews.length === 0 && (
                        <div className="py-20 text-center bg-white border border-dashed border-neutral-100 rounded-[40px] space-y-4">
                            <div className="p-5 bg-neutral-50 rounded-full inline-flex text-neutral-300"><MessageSquare className="w-10 h-10" /></div>
                            <h3 className="text-xl font-black text-neutral-900">Silence is Golden... or maybe just a filter?</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto font-medium">No reviews match your current filter or search criteria. Try a different query.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
