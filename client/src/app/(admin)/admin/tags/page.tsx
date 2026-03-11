'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import TagModal from './components/TagModal';

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string;
    product_count?: string | number;
}

export default function TagsPage() {
    const { token } = useAppStore();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const fetchTags = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tags`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch tags');
            const data = await res.json();
            setTags(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tag?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tags/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            fetchTags();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredTags = tags.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage product tags for filtering and organization.
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedTag(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Tag
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm flex items-center gap-2 border-b border-red-100">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="p-4">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredTags.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-neutral-400" />
                            </div>
                            <h3 className="text-neutral-900 font-medium mb-1">No tags found</h3>
                            <p className="text-neutral-500 text-sm">Create a new tag to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTags.map((tag) => (
                                <div key={tag.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm transition-all group">
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-neutral-900 truncate pr-4">{tag.name}</h4>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">/{tag.slug}</p>
                                        <div className="mt-2 text-xs font-medium text-neutral-400 bg-neutral-50 inline-block px-2 py-0.5 rounded-md">
                                            {tag.product_count || 0} Products
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setSelectedTag(tag); setIsModalOpen(true); }} className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(tag.id)} className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <TagModal
                    tag={selectedTag}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchTags}
                />
            )}
        </div>
    );
}
