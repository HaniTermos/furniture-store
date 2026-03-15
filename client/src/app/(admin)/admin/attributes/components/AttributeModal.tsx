'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
=======
import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, GripVertical, Loader2, Image as ImageIcon, AlertCircle, Save, Info } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
>>>>>>> d1d77d0 (dashboard and variants edits)
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
<<<<<<< HEAD
import type { Attribute, AttributeValue } from '../page';
=======

interface Attribute {
    id: string;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'image' | 'button' | 'radio';
    is_visible_on_product: boolean;
    is_used_for_variations: boolean;
    is_filterable: boolean;
    sort_order: number;
    options?: AttributeOption[];
}

interface AttributeOption {
    id: string;
    attribute_id: string;
    value: string;
    slug: string;
    color_hex?: string;
    image_url?: string;
    sort_order: number;
}
>>>>>>> d1d77d0 (dashboard and variants edits)

interface AttributeModalProps {
    attribute: Attribute | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AttributeModal({ attribute, onClose, onSuccess }: AttributeModalProps) {
<<<<<<< HEAD
    const { token } = useAppStore();
=======
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
    // In edit mode, we manage values separately so we can do API calls for them instantly
    // In create mode, we send them all in one big payload
    const [values, setValues] = useState<Partial<AttributeValue>[]>([]);
=======
    const [options, setOptions] = useState<Partial<AttributeOption>[]>([]);
>>>>>>> d1d77d0 (dashboard and variants edits)

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
<<<<<<< HEAD
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
=======
            setOptions(attribute.options ? JSON.parse(JSON.stringify(attribute.options)) : []);
        } else {
            setOptions([{ id: 'temp-1', value: '', color_hex: '#000000', image_url: '', slug: '', sort_order: 0 }]);
        }
    }, [attribute]);

    const handleAddOption = () => {
        const nextSortOrder = options.length;
        setOptions([...options, { 
            id: `temp-${Date.now()}`, 
            value: '', 
            color_hex: '#000000', 
            image_url: '', 
            slug: '', 
            sort_order: nextSortOrder 
        }]);
    };

    const handleRemoveOption = async (id: string, index: number) => {
        if (attribute && id && !id.startsWith('temp-')) {
            if (!confirm('Are you sure you want to delete this option? It may be used in existing product variants.')) return;
            try {
                await api.deleteAttributeOption(id);
                toast.success('Option deleted permanently');
            } catch (err: any) {
                toast.error(err.message || 'Failed to delete option');
>>>>>>> d1d77d0 (dashboard and variants edits)
                return;
            }
        }

<<<<<<< HEAD
        const newValues = [...values];
        newValues.splice(index, 1);
        setValues(newValues);
    };

    const handleValueChange = (index: number, field: keyof AttributeValue, val: any) => {
        const newValues = [...values];
        newValues[index] = { ...newValues[index], [field]: val };
        setValues(newValues);
=======
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, field: keyof AttributeOption, val: any) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: val };
        
        // Auto-generate slug for the value
        if (field === 'value') {
            newOptions[index].slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        
        setOptions(newOptions);
>>>>>>> d1d77d0 (dashboard and variants edits)
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

<<<<<<< HEAD
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
=======
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.adminUploadImage(formData);
            handleOptionChange(index, 'image_url', res.url);
            toast.success('Image uploaded');
        } catch (err: any) {
            toast.error(err.message || 'Image upload failed');
>>>>>>> d1d77d0 (dashboard and variants edits)
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (attribute) {
<<<<<<< HEAD
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
=======
                // UPDATE ATTRIBUTE
                await api.updateAttribute(attribute.id, formData);

                // UPSERT OPTIONS
                for (let i = 0; i < options.length; i++) {
                    const opt = { ...options[i], sort_order: i };
                    if (!opt.value?.trim()) continue;

                    if (opt.id && !opt.id.startsWith('temp-')) {
                        await api.updateAttributeOption(opt.id, opt);
                    } else {
                        await api.createAttributeOption(attribute.id, opt as any);
                    }
                }
                toast.success('Attribute updated successfully');
            } else {
                // CREATE ATTRIBUTE (Full Payload)
                const newAttr = await api.createAttribute(formData);
                
                for (let i = 0; i < options.length; i++) {
                    const opt = { ...options[i], sort_order: i };
                    if (!opt.value?.trim()) continue;
                    await api.createAttributeOption(newAttr.id, opt as any);
                }
                toast.success('Attribute created successfully');
>>>>>>> d1d77d0 (dashboard and variants edits)
            }

            onSuccess();
            onClose();
        } catch (err: any) {
<<<<<<< HEAD
            setError(err.message);
=======
            setError(err.message || 'Something went wrong');
            toast.error(err.message || 'Failed to save attribute');
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
        const oldIndex = values.findIndex((v) => v.id === active.id);
        const newIndex = values.findIndex((v) => v.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setValues(arrayMove(values, oldIndex, newIndex));
=======
        const oldIndex = options.findIndex((v) => v.id === active.id);
        const newIndex = options.findIndex((v) => v.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            setOptions(arrayMove(options, oldIndex, newIndex));
>>>>>>> d1d77d0 (dashboard and variants edits)
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
<<<<<<< HEAD
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
=======
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#FDFDFD] rounded-[2.5rem] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 py-8 border-b border-neutral-100 flex items-center justify-between bg-white z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-orange/10 rounded-2xl">
                            <Plus className="w-6 h-6 text-primary-orange" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                                {attribute ? 'Modify Dimension' : 'New Dimension'}
                            </h2>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Definition & Options Matrix</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-neutral-50 rounded-2xl transition-all text-neutral-400 hover:text-neutral-900 group">
                        <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form id="attributeForm" onSubmit={handleSubmit} className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                            {/* Settings Column */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <Info className="w-3 h-3" /> Core Identity
                                    </h3>

                                    <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-neutral-900 ml-1">Friendly Name</label>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
<<<<<<< HEAD
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 outline-none text-sm transition-all"
                                                placeholder="e.g. Color, Size, Material"
=======
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ 
                                                        ...formData, 
                                                        name: val,
                                                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                                                    });
                                                }}
                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange outline-none text-sm font-bold transition-all placeholder:text-neutral-300"
                                                placeholder="e.g. Fabric Color, Frame Material"
>>>>>>> d1d77d0 (dashboard and variants edits)
                                            />
                                        </div>

                                        <div className="space-y-2">
<<<<<<< HEAD
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
=======
                                            <label className="text-sm font-black text-neutral-900 ml-1">Visualization Style</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary-orange/5 focus:border-primary-orange outline-none text-sm font-bold cursor-pointer appearance-none"
                                            >
                                                <option value="select">Classic Dropdown Menu</option>
                                                <option value="button">Interactive Pilled Buttons</option>
                                                <option value="color">Visual Color Swatches</option>
                                                <option value="image">Material/Image Swatches</option>
                                                <option value="radio">Radial Selection List</option>
                                            </select>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
<<<<<<< HEAD
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">Behavior</h3>

                                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-100">
                                        <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
=======
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2">System Behavior</h3>
                                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
                                        <label className="flex items-center gap-4 p-6 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_used_for_variations ? 'bg-primary-orange/10 text-primary-orange' : 'bg-neutral-100 text-neutral-400'}`}>
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-neutral-900">Enable Variations</div>
                                                <p className="text-[11px] text-neutral-400 font-medium">Generate unique SKU/Price combinations.</p>
                                            </div>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                            <input
                                                type="checkbox"
                                                checked={formData.is_used_for_variations}
                                                onChange={e => setFormData({ ...formData, is_used_for_variations: e.target.checked })}
<<<<<<< HEAD
                                                className="w-4 h-4 text-primary-orange rounded border-neutral-300 focus:ring-primary-orange"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900">Used for Variations</div>
                                                <div className="text-xs text-neutral-500 mt-0.5">Allow generating unique SKUs, prices, & stock based on this attribute.</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
=======
                                                className="w-5 h-5 text-primary-orange rounded-lg border-neutral-200 focus:ring-primary-orange shadow-sm"
                                            />
                                        </label>

                                        <label className="flex items-center gap-4 p-6 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_filterable ? 'bg-blue-50 text-blue-500' : 'bg-neutral-100 text-neutral-400'}`}>
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-neutral-900">Store Filter</div>
                                                <p className="text-[11px] text-neutral-400 font-medium">Show in collection sidebar filters.</p>
                                            </div>
>>>>>>> d1d77d0 (dashboard and variants edits)
                                            <input
                                                type="checkbox"
                                                checked={formData.is_filterable}
                                                onChange={e => setFormData({ ...formData, is_filterable: e.target.checked })}
<<<<<<< HEAD
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
=======
                                                className="w-5 h-5 text-primary-orange rounded-lg border-neutral-200 focus:ring-primary-orange shadow-sm"
                                            />
>>>>>>> d1d77d0 (dashboard and variants edits)
                                        </label>
                                    </div>
                                </div>
                            </div>

<<<<<<< HEAD
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
=======
                            {/* Values Column */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Values / Option Pool</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg shadow-neutral-200"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Append Value
                                    </button>
                                </div>

                                <div className="bg-neutral-50/50 rounded-[2rem] border border-neutral-100 p-6">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={options.map(v => v.id as string)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-4">
                                                {options.map((val, index) => (
                                                    <SortableOptionItem
                                                        key={val.id}
                                                        option={val}
                                                        index={index}
                                                        type={formData.type}
                                                        onChange={handleOptionChange}
                                                        onRemove={handleRemoveOption}
                                                        onImageUpload={handleImageUpload}
                                                    />
                                                ))}
                                                {options.length === 0 && (
                                                    <div className="text-center py-16 space-y-4">
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-neutral-100 text-neutral-200">
                                                            <Plus className="w-8 h-8" />
                                                        </div>
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Dimension needs values</p>
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                        Cancel
=======
                {/* Footer */}
                <div className="px-10 py-6 bg-white border-t border-neutral-50 flex items-center justify-end gap-4 z-10 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
                    >
                        Discard
>>>>>>> d1d77d0 (dashboard and variants edits)
                    </button>
                    <button
                        type="submit"
                        form="attributeForm"
                        disabled={submitting}
<<<<<<< HEAD
                        className="flex items-center gap-2 px-8 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {attribute ? 'Save Changes' : 'Create Attribute'}
=======
                        className="flex items-center gap-2 px-10 py-3.5 bg-primary-orange text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-orange/20 hover:bg-primary-orange-dark transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {attribute ? 'Save Changes' : 'Create Dimension'}
>>>>>>> d1d77d0 (dashboard and variants edits)
                    </button>
                </div>
            </div>
        </div>
    );
}

<<<<<<< HEAD
// ─── SORTABLE VALUE ITEM ──────────────────────────────────────────

interface SortableValueItemProps {
    value: Partial<AttributeValue>;
    index: number;
    type: string;
    onChange: (index: number, field: keyof AttributeValue, val: any) => void;
=======
// ─── SORTABLE OPTION ITEM ──────────────────────────────────────────

interface SortableOptionItemProps {
    option: Partial<AttributeOption>;
    index: number;
    type: string;
    onChange: (index: number, field: keyof AttributeOption, val: any) => void;
>>>>>>> d1d77d0 (dashboard and variants edits)
    onRemove: (id: string, index: number) => void;
    onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

<<<<<<< HEAD
function SortableValueItem({ value, index, type, onChange, onRemove, onImageUpload }: SortableValueItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: value.id as string });
=======
function SortableOptionItem({ option, index, type, onChange, onRemove, onImageUpload }: SortableOptionItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id as string });
>>>>>>> d1d77d0 (dashboard and variants edits)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
<<<<<<< HEAD
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 bg-neutral-50 border rounded-xl transition-colors ${isDragging ? 'border-primary-orange shadow-lg bg-white' : 'border-neutral-200 hover:border-neutral-300'}`}>
=======
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`flex items-center gap-4 p-4 bg-white border-2 rounded-2xl transition-all ${
                isDragging 
                ? 'border-primary-orange shadow-2xl scale-[1.02] z-40' 
                : 'border-neutral-100 hover:border-neutral-200'
            }`}
        >
>>>>>>> d1d77d0 (dashboard and variants edits)
            <div {...attributes} {...listeners} className="p-1 text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </div>

<<<<<<< HEAD
            {/* Type-specific inputs */}
            {type === 'color' && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shadow-sm flex-shrink-0 cursor-pointer">
                    <input
                        type="color"
                        value={value.color_hex || '#000000'}
                        onChange={(e) => onChange(index, 'color_hex', e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
=======
            {type === 'color' && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-100 shadow-sm flex-shrink-0 cursor-pointer hover:ring-4 hover:ring-neutral-50 transition-all">
                    <input
                        type="color"
                        value={option.color_hex || '#000000'}
                        onChange={(e) => onChange(index, 'color_hex', e.target.value)}
                        className="absolute -top-3 -left-3 w-20 h-20 cursor-pointer"
>>>>>>> d1d77d0 (dashboard and variants edits)
                    />
                </div>
            )}

            {type === 'image' && (
<<<<<<< HEAD
                <div className="relative w-10 h-10 rounded-lg border border-neutral-200 bg-white shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden group">
                    {value.image_url ? (
                        <img src={value.image_url} alt="Swatch" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-primary-orange transition-colors" />
                    )}
                    <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/10 transition-colors">
=======
                <div className="relative w-12 h-12 rounded-xl border-2 border-dashed border-neutral-100 bg-neutral-50 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden group hover:border-primary-orange transition-all">
                    {option.image_url ? (
                        <img src={option.image_url} alt="Swatch" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-neutral-300 group-hover:text-primary-orange transition-colors" />
                    )}
                    <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/5 transition-colors">
>>>>>>> d1d77d0 (dashboard and variants edits)
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageUpload(index, e)}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

<<<<<<< HEAD
            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    required
                    value={value.value || ''}
                    onChange={(e) => onChange(index, 'value', e.target.value)}
                    placeholder="Value Name (e.g. Red, Small, Oak)"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange placeholder-neutral-400"
                />
=======
            <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        required
                        value={option.value || ''}
                        onChange={(e) => onChange(index, 'value', e.target.value)}
                        placeholder="Option Value (e.g. Oak, XL, Navy)"
                        className="w-full px-4 py-2 bg-neutral-50 border border-transparent rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:border-primary-orange placeholder:text-neutral-300"
                    />
                </div>
                <div className="hidden sm:block">
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest font-mono">
                        {option.slug || 'slug-auto'}
                    </span>
                </div>
>>>>>>> d1d77d0 (dashboard and variants edits)
            </div>

            <button
                type="button"
<<<<<<< HEAD
                onClick={() => onRemove(value.id as string, index)}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Remove Value"
            >
                <Trash2 className="w-4 h-4" />
=======
                onClick={() => onRemove(option.id as string, index)}
                className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                title="Remove Option"
            >
                <Trash2 className="w-5 h-5" />
>>>>>>> d1d77d0 (dashboard and variants edits)
            </button>
        </div>
    );
}
