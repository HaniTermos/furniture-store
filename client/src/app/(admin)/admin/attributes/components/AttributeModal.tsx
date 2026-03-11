'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Attribute, AttributeValue } from '../page';

interface AttributeModalProps {
    attribute: Attribute | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AttributeModal({ attribute, onClose, onSuccess }: AttributeModalProps) {
    const { token } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'select' as Attribute['type'],
        is_visible_on_product: true,
        is_used_for_variations: true,
        is_filterable: true,
        sort_order: 0,
    });

    // In edit mode, we manage values separately so we can do API calls for them instantly
    // In create mode, we send them all in one big payload
    const [values, setValues] = useState<Partial<AttributeValue>[]>([]);

    useEffect(() => {
        if (attribute) {
            setFormData({
                name: attribute.name,
                slug: attribute.slug,
                type: attribute.type,
                is_visible_on_product: attribute.is_visible_on_product,
                is_used_for_variations: attribute.is_used_for_variations,
                is_filterable: attribute.is_filterable,
                sort_order: attribute.sort_order,
            });
            // Deep copy to allow local editing before save
            setValues(JSON.parse(JSON.stringify(attribute.values)));
        } else {
            // Default 1 empty value row for convenience
            setValues([{ id: 'temp-1', value: '', color_hex: '', image_url: '', slug: '', sort_order: 0 }]);
        }
    }, [attribute]);

    const handleAddValue = () => {
        setValues([...values, { id: `temp-${Date.now()}`, value: '', color_hex: '#000000', image_url: '', slug: '', sort_order: values.length }]);
    };

    const handleRemoveValue = async (id: string, index: number) => {
        // If it's a real ID from DB, we need to call delete API
        if (attribute && !id.startsWith('temp-')) {
            if (!confirm('Delete this value? It might be in use by products.')) return;
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes/${attribute.id}/values/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err: any) {
                alert('Could not delete value. ' + err.message);
                return;
            }
        }

        const newValues = [...values];
        newValues.splice(index, 1);
        setValues(newValues);
    };

    const handleValueChange = (index: number, field: keyof AttributeValue, val: any) => {
        const newValues = [...values];
        newValues[index] = { ...newValues[index], [field]: val };
        setValues(newValues);
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imgData = new FormData();
        imgData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/upload/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: imgData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            handleValueChange(index, 'image_url', data.url);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (attribute) {
                // UPDATE MODE
                // 1. Update main attribute
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes/${attribute.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(formData),
                });

                // 2. Diff and update values
                // For simplicity, we just loop and create/update based on ID presence
                for (let i = 0; i < values.length; i++) {
                    const v = { ...values[i], sort_order: i };
                    if (!v.value?.trim()) continue;

                    if (v.id && !v.id.startsWith('temp-')) {
                        // Exists
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes/${attribute.id}/values/${v.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify(v),
                        });
                    } else {
                        // New
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes/${attribute.id}/values`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify(v),
                        });
                    }
                }
            } else {
                // CREATE MODE (Single Payload)
                const payload = {
                    ...formData,
                    values: values.map((v, i) => ({ ...v, sort_order: i })).filter(v => v.value?.trim() !== '')
                };

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create attribute');
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // DND Kit Setup
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = values.findIndex((v) => v.id === active.id);
        const newIndex = values.findIndex((v) => v.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setValues(arrayMove(values, oldIndex, newIndex));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#FAFAFA] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10 flex-shrink-0">
                    <h2 className="text-xl font-bold">{attribute ? 'Edit Attribute' : 'Create Attribute'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form id="attributeForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* Split layout: Left (Settings), Right (Values) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                            {/* Left Column: Core Setup */}
                            <div className="md:col-span-5 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">Configuration</h3>

                                    <div className="p-5 bg-white rounded-2xl border border-neutral-100 shadow-sm space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none text-sm transition-all"
                                                placeholder="e.g. Color, Size, Material"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Presentation Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none text-sm cursor-pointer"
                                            >
                                                <option value="select">Dropdown Select</option>
                                                <option value="button">Pill Buttons</option>
                                                <option value="color">Color Swatches (RGB)</option>
                                                <option value="image">Image Swatches</option>
                                                <option value="radio">Radio Buttons</option>
                                            </select>
                                            <p className="text-xs text-neutral-500 mt-1">How this attribute appears on the product page.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">Behavior</h3>

                                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-100">
                                        <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_used_for_variations}
                                                onChange={e => setFormData({ ...formData, is_used_for_variations: e.target.checked })}
                                                className="w-4 h-4 text-primary-orange rounded border-neutral-300 focus:ring-primary-orange"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900">Used for Variations</div>
                                                <div className="text-xs text-neutral-500 mt-0.5">Allow generating unique SKUs, prices, & stock based on this attribute.</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_filterable}
                                                onChange={e => setFormData({ ...formData, is_filterable: e.target.checked })}
                                                className="w-4 h-4 text-primary-orange rounded border-neutral-300 focus:ring-primary-orange"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900">Filterable</div>
                                                <div className="text-xs text-neutral-500 mt-0.5">Use this attribute in the shop page sidebar filters.</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_visible_on_product}
                                                onChange={e => setFormData({ ...formData, is_visible_on_product: e.target.checked })}
                                                className="w-4 h-4 text-primary-orange rounded border-neutral-300 focus:ring-primary-orange"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900">Visible on Product Page</div>
                                                <div className="text-xs text-neutral-500 mt-0.5">Show in the "Additional Information" tab.</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Values */}
                            <div className="md:col-span-7 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Values / Options</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddValue}
                                        className="text-xs font-semibold text-primary-orange hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add Value
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={values.map(v => v.id as string)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-3">
                                                {values.map((val, index) => (
                                                    <SortableValueItem
                                                        key={val.id}
                                                        value={val}
                                                        index={index}
                                                        type={formData.type}
                                                        onChange={handleValueChange}
                                                        onRemove={handleRemoveValue}
                                                        onImageUpload={handleImageUpload}
                                                    />
                                                ))}
                                                {values.length === 0 && (
                                                    <div className="text-center py-8 text-neutral-400 text-sm">
                                                        No values added yet. Click "Add Value" to start.
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="attributeForm"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {attribute ? 'Save Changes' : 'Create Attribute'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SORTABLE VALUE ITEM ──────────────────────────────────────────

interface SortableValueItemProps {
    value: Partial<AttributeValue>;
    index: number;
    type: string;
    onChange: (index: number, field: keyof AttributeValue, val: any) => void;
    onRemove: (id: string, index: number) => void;
    onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

function SortableValueItem({ value, index, type, onChange, onRemove, onImageUpload }: SortableValueItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: value.id as string });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 bg-neutral-50 border rounded-xl transition-colors ${isDragging ? 'border-primary-orange shadow-lg bg-white' : 'border-neutral-200 hover:border-neutral-300'}`}>
            <div {...attributes} {...listeners} className="p-1 text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Type-specific inputs */}
            {type === 'color' && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shadow-sm flex-shrink-0 cursor-pointer">
                    <input
                        type="color"
                        value={value.color_hex || '#000000'}
                        onChange={(e) => onChange(index, 'color_hex', e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                </div>
            )}

            {type === 'image' && (
                <div className="relative w-10 h-10 rounded-lg border border-neutral-200 bg-white shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden group">
                    {value.image_url ? (
                        <img src={value.image_url} alt="Swatch" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-primary-orange transition-colors" />
                    )}
                    <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/10 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageUpload(index, e)}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    required
                    value={value.value || ''}
                    onChange={(e) => onChange(index, 'value', e.target.value)}
                    placeholder="Value Name (e.g. Red, Small, Oak)"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange placeholder-neutral-400"
                />
            </div>

            <button
                type="button"
                onClick={() => onRemove(value.id as string, index)}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Remove Value"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
