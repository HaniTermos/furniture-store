'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Eye, Settings2 } from 'lucide-react';
import { useAppStore } from '@/store';
import AttributeModal from './components/AttributeModal';

export interface AttributeValue {
    id: string;
    attribute_id: string;
    value: string;
    color_hex: string | null;
    image_url: string | null;
    slug: string;
    sort_order: number;
}

export interface Attribute {
    id: string;
    name: string;
    slug: string;
    type: 'select' | 'radio' | 'color' | 'image' | 'button';
    is_visible_on_product: boolean;
    is_used_for_variations: boolean;
    is_filterable: boolean;
    sort_order: number;
    values: AttributeValue[];
}

export default function AttributesPage() {
    const { token } = useAppStore();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);

    const fetchAttributes = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch attributes');
            const data = await res.json();
            setAttributes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this attribute and all its values?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            fetchAttributes();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredAttributes = attributes.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Define product variations like sizes, colors, and materials.
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedAttribute(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Attribute
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search attributes..."
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredAttributes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings2 className="w-6 h-6 text-neutral-400" />
                            </div>
                            <h3 className="text-neutral-900 font-medium mb-1">No attributes found</h3>
                            <p className="text-neutral-500 text-sm">Create an attribute to manage product variations.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredAttributes.map((attribute) => (
                                <div key={attribute.id} className="flex flex-col p-5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-neutral-900 truncate">{attribute.name}</h4>
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                                    {attribute.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500 truncate">/{attribute.slug}</p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedAttribute(attribute); setIsModalOpen(true); }} className="p-2 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(attribute.id)} className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {attribute.is_used_for_variations && (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                                <Settings2 className="w-3 h-3" /> Creates Variations
                                            </span>
                                        )}
                                        {attribute.is_filterable && (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                                                <Search className="w-3 h-3" /> Filterable
                                            </span>
                                        )}
                                        {attribute.is_visible_on_product && (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                                                <Eye className="w-3 h-3" /> Visible Details
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-5 border-t border-neutral-50 pt-4">
                                        <div className="flex items-center justify-between mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                            <span>Values ({attribute.values.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {attribute.values.slice(0, 10).map(val => (
                                                <div key={val.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-sm">
                                                    {attribute.type === 'color' && val.color_hex && (
                                                        <span className="w-3 h-3 rounded-full shadow-sm border border-neutral-200" style={{ backgroundColor: val.color_hex }} />
                                                    )}
                                                    {attribute.type === 'image' && val.image_url && (
                                                        <img src={val.image_url} alt={val.value} className="w-4 h-4 rounded-sm object-cover" />
                                                    )}
                                                    <span className="text-neutral-700 font-medium">{val.value}</span>
                                                </div>
                                            ))}
                                            {attribute.values.length > 10 && (
                                                <div className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-500 text-sm font-medium">
                                                    +{attribute.values.length - 10} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AttributeModal
                    attribute={selectedAttribute}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchAttributes}
                />
            )}
        </div>
    );
}
