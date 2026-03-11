'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string;
}

interface TagModalProps {
    tag: Tag | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TagModal({ tag, onClose, onSuccess }: TagModalProps) {
    const { token } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        if (tag) {
            setFormData({
                name: tag.name || '',
                slug: tag.slug || '',
                description: tag.description || '',
            });
        }
    }, [tag]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const endpoint = tag
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/tags/${tag.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/tags`;

            const method = tag ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save tag');

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#FAFAFA] rounded-3xl w-full max-w-lg shadow-2xl">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white rounded-t-3xl">
                    <h2 className="text-xl font-bold">{tag ? 'Edit Tag' : 'Create Tag'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="tagForm" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                placeholder="e.g. Minimalist"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Slug (optional)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none"
                                placeholder="Auto-generated if empty"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none resize-none"
                            />
                        </div>
                    </form>
                </div>

                <div className="bg-white px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="tagForm"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {tag ? 'Save Changes' : 'Create Tag'}
                    </button>
                </div>
            </div>
        </div>
    );
}
