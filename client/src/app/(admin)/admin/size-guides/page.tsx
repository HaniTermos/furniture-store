'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import SizeGuideModal from './components/SizeGuideModal';

export interface SizeGuide {
    id: string;
    name: string;
    description: string;
    content_html: string;
    content_json: any;
    created_at: string;
    updated_at: string;
}

export default function SizeGuidesPage() {
    const { token } = useAppStore();
    const [guides, setGuides] = useState<SizeGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<SizeGuide | null>(null);

    const fetchGuides = async () => {
        try {
            const data = await api.getAdminSizeGuides();
            setGuides(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this size guide? Products using it will lose their size guide attachment.')) return;
        try {
            await api.deleteSizeGuide(id);
            fetchGuides();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredGuides = guides.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Size Guides</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Create and manage dimension charts and fitting instructions reusable across products.
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedGuide(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Size Guide
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search size guides..."
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 bg-neutral-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6 text-neutral-400" />
                            </div>
                            <h3 className="text-neutral-900 font-medium mb-1">No size guides yet</h3>
                            <p className="text-neutral-500 text-sm">Create standard sizing templates for products like tables, sofas, and beds.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGuides.map((guide) => (
                                <div key={guide.id} className="flex flex-col p-5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="min-w-0 pr-4">
                                            <h4 className="font-semibold text-neutral-900 truncate">{guide.name}</h4>
                                            {guide.description && (
                                                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{guide.description}</p>
                                            )}
                                        </div>
                                        <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400 flex-shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-50">
                                        <span className="text-xs text-neutral-400 font-medium">
                                            Updated {new Date(guide.updated_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedGuide(guide); setIsModalOpen(true); }} className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(guide.id)} className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <SizeGuideModal
                    guide={selectedGuide}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchGuides}
                />
            )}
        </div>
    );
}
