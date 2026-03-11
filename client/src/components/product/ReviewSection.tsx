'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

interface ReviewSectionProps {
    productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    const queryClient = useQueryClient();
    const { user } = useAppStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [title, setTitle] = useState('');
    const [showForm, setShowForm] = useState(false);

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => api.getProductReviews(productId),
    });

    const mutation = useMutation({
        mutationFn: (newReview: any) => api.createReview(newReview),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            setShowForm(false);
            setComment('');
            setTitle('');
            setRating(5);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to leave a review');
            return;
        }
        mutation.mutate({
            product_id: productId,
            rating,
            title,
            comment,
        });
    };

    const reviews = reviewsData?.reviews || [];

    return (
        <section className="py-24 bg-white">
            <div className="container-wide section-padding">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Summary & Form */}
                    <div className="w-full md:w-1/3">
                        <h2 className="text-3xl font-['DM_Serif_Display'] text-neutral-900 mb-2">Customer Reviews</h2>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1 text-primary-orange">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(reviewsData?.averageRating || 4.5) ? 'fill-current' : 'text-neutral-200'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-neutral-500">{reviewsData?.total || 0} reviews</span>
                        </div>

                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn-secondary w-full"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Write a Review
                            </button>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100"
                            >
                                <h3 className="font-semibold text-neutral-900">Share your thoughts</h3>

                                <div className="flex items-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className={`p-1 transition-colors ${s <= rating ? 'text-primary-orange' : 'text-neutral-300'}`}
                                        >
                                            <Star className={`w-6 h-6 ${s <= rating ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>

                                <input
                                    placeholder="Review Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange"
                                    required
                                />

                                <textarea
                                    placeholder="Your review details..."
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-orange resize-none"
                                    required
                                />

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="btn-primary flex-1"
                                    >
                                        {mutation.isPending ? 'Sending...' : 'Submit Review'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="p-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="flex-1 space-y-8">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-40 bg-neutral-50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                                <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {reviews.map((review: any) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        className="pb-8 border-b border-neutral-100 last:border-0"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-neutral-900">{review.user_name || 'Verified Customer'}</p>
                                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                                                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary-orange">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-neutral-900 mb-2">{review.title}</h4>
                                        <p className="text-neutral-600 text-sm leading-relaxed font-light">
                                            {review.comment}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
