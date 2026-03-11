'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { SizeGuide } from '../page';

interface SizeGuideModalProps {
    guide: SizeGuide | null;
    onClose: () => void;
    onSuccess: () => void;
}

// Very basic table-based UI for now. Later we can enhance with a rich text editor for content_html.
export default function SizeGuideModal({ guide, onClose, onSuccess }: SizeGuideModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        content_html: '',
    });

    // We'll manage a simple dimensional table as the "content_json" backing structure for now.
    // e.g. [{"label": "Width", "cm": "200", "inches": "78.7"}, ...]
    const [dimensions, setDimensions] = useState<{ id: string; label: string; cm: string; inches: string }[]>([]);

    useEffect(() => {
        if (guide) {
            setFormData({
                name: guide.name || '',
                description: guide.description || '',
                content_html: guide.content_html || '',
            });
            if (guide.content_json && Array.isArray(guide.content_json)) {
                setDimensions(guide.content_json);
            } else {
                setDimensions([]);
            }
        } else {
            setDimensions([{ id: 'temp-1', label: 'Width', cm: '', inches: '' }]);
        }
    }, [guide]);

    const handleAddDimension = () => {
        setDimensions([...dimensions, { id: `temp-${Date.now()}`, label: '', cm: '', inches: '' }]);
    };

    const handleRemoveDimension = (index: number) => {
        const newDim = [...dimensions];
        newDim.splice(index, 1);
        setDimensions(newDim);
    };

    const handleDimensionChange = (index: number, field: keyof typeof dimensions[0], val: string) => {
        const newDim = [...dimensions];
        newDim[index] = { ...newDim[index], [field]: val };
        setDimensions(newDim);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                content_json: dimensions.filter(d => d.label.trim() !== '')
            };

            if (guide) {
                await api.updateSizeGuide(guide.id, payload);
            } else {
                await api.createSizeGuide(payload);
            }

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
            <div className="relative bg-[#FAFAFA] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10 flex-shrink-0">
                    <h2 className="text-xl font-bold">{guide ? 'Edit Size Guide' : 'Create Size Guide'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="sizeGuideForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Guide Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none transition-all text-sm"
                                    placeholder="e.g. Standard 3-Seater Sofa"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none transition-all resize-none text-sm"
                                    placeholder="Brief explanation of how to measure..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900">Dimensions Table</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">Build a structured table of measurements.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddDimension}
                                    className="text-xs font-semibold text-primary-orange hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-orange-100"
                                >
                                    <Plus className="w-3 h-3" /> Add Row
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 bg-neutral-50 p-3 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <div className="col-span-4">Measurement</div>
                                    <div className="col-span-3">Centimeters</div>
                                    <div className="col-span-3">Inches</div>
                                    <div className="col-span-2 text-center">Action</div>
                                </div>

                                <div className="divide-y divide-neutral-100">
                                    {dimensions.map((dim, index) => (
                                        <div key={dim.id} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-neutral-50/50 transition-colors">
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    value={dim.label}
                                                    onChange={e => handleDimensionChange(index, 'label', e.target.value)}
                                                    placeholder="e.g. Total Width"
                                                    className="w-full px-3 py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-primary-orange/30 rounded-lg text-sm outline-none transition-all placeholder-neutral-300"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    value={dim.cm}
                                                    onChange={e => handleDimensionChange(index, 'cm', e.target.value)}
                                                    placeholder="200"
                                                    className="w-full px-3 py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-primary-orange/30 rounded-lg text-sm outline-none transition-all placeholder-neutral-300"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    value={dim.inches}
                                                    onChange={e => handleDimensionChange(index, 'inches', e.target.value)}
                                                    placeholder="78.7"
                                                    className="w-full px-3 py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-primary-orange/30 rounded-lg text-sm outline-none transition-all placeholder-neutral-300"
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDimension(index)}
                                                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {dimensions.length === 0 && (
                                        <div className="p-8 text-center text-sm text-neutral-400">
                                            No dimensions defined. Add a row to start building your size guide table.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors text-neutral-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="sizeGuideForm"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {guide ? 'Save Changes' : 'Create Size Guide'}
                    </button>
                </div>
            </div>
        </div>
    );
}
