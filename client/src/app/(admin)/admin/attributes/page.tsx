'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Loader2, 
    Layers, 
    Filter, 
    Eye, 
    ChevronRight, 
    Search,
    AlertCircle,
    Package
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AttributeModal from './components/AttributeModal';

export default function AttributesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);

    // Fetch Attributes
    const { data: attributes, isLoading, isError } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: () => api.getAttributes(),
    });

    // Delete Mutation
    const deleteAttr = useMutation({
        mutationFn: (id: string) => api.deleteAttribute(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            toast.success('Dimension removed from system');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to delete dimension');
        }
    });

    const filteredAttributes = attributes?.filter((app: any) => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleEdit = (attr: any) => {
        setSelectedAttribute(attr);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedAttribute(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this dimension? This will remove all associated options and might break existing variants.')) {
            deleteAttr.mutate(id);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-neutral-100">
                <div className="max-w-[1600px] mx-auto px-6 py-10 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-orange/10 rounded-xl">
                                    <Layers className="w-5 h-5 text-primary-orange" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-orange">
                                    System Core
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
                                Product Dimensions
                            </h1>
                            <p className="text-sm font-medium text-neutral-400 mt-2">
                                Define global attributes like Color, Size, or Material to power variants and filters.
                            </p>
                        </div>

                        <button
                            onClick={handleAddNew}
                            className="bg-neutral-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-neutral-200 hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Plus className="w-4 h-4" />
                            Define New Dimension
                        </button>
                    </div>

                    {/* Stats & Search Bar */}
                    <div className="mt-12 flex flex-col lg:flex-row items-center gap-6">
                        <div className="relative flex-1 w-full lg:w-auto overflow-hidden">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Filter dimensions by name or system slug..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange outline-none text-sm font-bold transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100">
                            {[
                                { label: 'Active', count: attributes?.length || 0, color: 'text-primary-orange' },
                                { label: 'In Use', count: attributes?.filter((a: any) => a.is_used_for_variations)?.length || 0, color: 'text-blue-500' }
                            ].map((s) => (
                                <div key={s.label} className="px-6 py-2.5 bg-white rounded-xl shadow-sm border border-neutral-100/50 flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{s.label}</span>
                                    <span className={`text-sm font-black ${s.color}`}>{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-neutral-100 border-t-primary-orange rounded-full animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Synchronizing dimensions...</p>
                    </div>
                ) : isError ? (
                    <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-2xl mx-auto">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-neutral-900 mb-2">Data Synchronisation Failed</h3>
                        <p className="text-sm font-medium text-neutral-500 mb-8">We couldn't reach the dimension service. Please check your connection.</p>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-attributes'] })} className="px-8 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                            Retry Connection
                        </button>
                    </div>
                ) : filteredAttributes.length === 0 ? (
                    <div className="bg-white border border-neutral-100 p-24 rounded-[3rem] text-center flex flex-col items-center justify-center shadow-sm">
                        <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-neutral-100 text-neutral-200">
                            <Layers className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 mb-3">No Dimensions Found</h3>
                        <p className="text-sm font-medium text-neutral-400 max-w-sm mb-10 leading-relaxed">
                            {searchQuery ? "Your search didn't match any existing dimensions." : "You haven't defined any global product dimensions yet."}
                        </p>
                        <button onClick={handleAddNew} className="px-10 py-4 bg-primary-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-primary-orange/20 hover:scale-105 transition-all">
                            Initialize First Dimension
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredAttributes.map((attr: any) => (
                            <div 
                                key={attr.id}
                                className="group relative bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-primary-orange/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Type Badge */}
                                <div className="absolute top-8 right-8 px-4 py-1.5 bg-neutral-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-1 bg-primary-orange rounded-full" />
                                    {attr.type}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-black text-neutral-900 group-hover:text-primary-orange transition-colors">
                                        {attr.name}
                                    </h3>
                                    <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-1">
                                        {attr.slug}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Swatches / Values Preview */}
                                    <div className="flex flex-wrap gap-2">
                                        {(attr.options || []).slice(0, 6).map((opt: any) => (
                                            <div key={opt.id} className="group/opt relative" title={opt.value}>
                                                {attr.type === 'color' ? (
                                                    <div 
                                                        className="w-7 h-7 rounded-lg border border-neutral-100 shadow-sm"
                                                        style={{ backgroundColor: opt.color_hex }}
                                                    />
                                                ) : attr.type === 'image' ? (
                                                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-100 shadow-sm">
                                                        <img src={opt.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1 bg-neutral-50 rounded-lg text-[10px] font-bold text-neutral-500 border border-neutral-100">
                                                        {opt.value}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(attr.options || []).length > 6 && (
                                            <div className="flex items-center justify-center w-7 h-7 bg-neutral-50 rounded-lg text-[10px] font-black text-neutral-400 border border-neutral-100">
                                                +{(attr.options || []).length - 6}
                                            </div>
                                        )}
                                        {(attr.options || []).length === 0 && (
                                            <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic">
                                                Void Dimension
                                            </div>
                                        )}
                                    </div>

                                    {/* Capabilities */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-50">
                                        <div className={`p-1.5 rounded-lg ${attr.is_used_for_variations ? 'bg-primary-orange/10 text-primary-orange' : 'bg-neutral-50 text-neutral-300'}`} title="Variations">
                                            <Package className="w-3.5 h-3.5" />
                                        </div>
                                        <div className={`p-1.5 rounded-lg ${attr.is_filterable ? 'bg-blue-50 text-blue-500' : 'bg-neutral-50 text-neutral-300'}`} title="Filterable">
                                            <Filter className="w-3.5 h-3.5" />
                                        </div>
                                        <div className={`p-1.5 rounded-lg ${attr.is_visible_on_product ? 'bg-green-50 text-green-500' : 'bg-neutral-50 text-neutral-300'}`} title="Visible on frontend">
                                            <Eye className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => handleEdit(attr)}
                                        className="flex-1 px-4 py-3 bg-neutral-50 hover:bg-neutral-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-neutral-100 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                        Configure
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attr.id)}
                                        className="p-3 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}

            {isModalOpen && (
                <AttributeModal
                    attribute={selectedAttribute}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
                        setIsModalOpen(false);
                    }}

                />
            )}
        </div>
    );
}
