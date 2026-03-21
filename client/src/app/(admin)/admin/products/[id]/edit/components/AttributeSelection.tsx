'use client';

import { Plus, X, Settings2 } from 'lucide-react';


interface GlobalAttribute {
    id: string;
    name: string;
    type: string;
    values: { id: string; value: string; color_hex: string | null; image_url: string | null }[];
}

interface SelectedAttribute {
    attribute_id: string;
    value_id: string;

}

interface AttributeSelectionProps {
    availableAttributes: GlobalAttribute[];
    selectedAttributes: SelectedAttribute[];
    onChange: (attributes: SelectedAttribute[]) => void;
}

export default function AttributeSelection({ availableAttributes, selectedAttributes, onChange }: AttributeSelectionProps) {
    const handleAddAttribute = () => {
        if (availableAttributes.length === 0) return;


        const firstAttr = availableAttributes[0];
        const newVal = firstAttr.values.length > 0 ? firstAttr.values[0].id : '';

        onChange([...selectedAttributes, {
            attribute_id: firstAttr.id,
            value_id: newVal,
        }]);
    };

    const updateSelected = (index: number, field: 'attribute_id' | 'value_id', val: string) => {
        const next = [...selectedAttributes];


        if (field === 'attribute_id') {
            const attr = availableAttributes.find(a => a.id === val);
            next[index] = {
                ...next[index],
                attribute_id: val,
                value_id: attr?.values[0]?.id || '',
            };
        } else {
            next[index] = { ...next[index], value_id: val };

        }

        onChange(next);
    };

    const removeSelected = (index: number) => {
        onChange(selectedAttributes.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-primary-orange" />
                        Global Attributes
                    </h3>
                    <p className="text-sm text-neutral-500">Assign standard properties like Material or Finish.</p>
                </div>
                <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-orange/10 text-primary-orange rounded-xl text-sm font-bold hover:bg-primary-orange/20 transition-all border border-primary-orange/20"
                >
                    <Plus className="w-4 h-4" />
                    Assign Attribute
                </button>
            </div>

            <div className="space-y-3">
                {selectedAttributes.map((selected, idx) => {
                    const attrInfo = availableAttributes.find(a => a.id === selected.attribute_id);

                    return (
                        <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-neutral-200 transition-all group">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Attribute Type</label>
                                <select
                                    value={selected.attribute_id}
                                    onChange={(e) => updateSelected(idx, 'attribute_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-orange/10 focus:border-primary-orange/30 transition-all"
                                >
                                    {availableAttributes.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-[1.5] space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Assigned Value</label>
                                <select
                                    value={selected.value_id}
                                    onChange={(e) => updateSelected(idx, 'value_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-orange/10 focus:border-primary-orange/30 transition-all"
                                >
                                    <option value="">Select a value...</option>
                                    {attrInfo?.values.map(v => (
                                        <option key={v.id} value={v.id}>{v.value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center pt-4 sm:pt-6">

                                <button
                                    type="button"
                                    onClick={() => removeSelected(idx)}
                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {selectedAttributes.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/30">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 mb-4"><Settings2 className="w-6 h-6" /></div>
                        <h4 className="text-sm font-bold text-neutral-600">No global attributes assigned</h4>
                        <p className="text-xs mt-1 text-neutral-400 text-center max-w-[240px]">Global attributes help buyers filter products and see technical specifications.</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                <Settings2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Pro Tip:</strong> Global attributes (Material, Finish, Style) describe the product&apos;s properties. For purchasable options with stock (Color, Size), use the <strong>Variations &amp; Stock</strong> section below.

                </p>
            </div>
        </div>
    );
}
