'use client';

import { useState } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, CheckCircle2, Loader2, Plus } from 'lucide-react';
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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';

interface ProductImage {
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
}

interface ProductGalleryProps {
    images: ProductImage[];
    setImages: (images: ProductImage[]) => void;
    token: string;
}

export default function ProductGallery({ images, setImages, token }: ProductGalleryProps) {
    const [uploading, setUploading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedImages: ProductImage[] = [];
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('image', files[i]);

                const res = await api.adminUploadImage(formData);
                uploadedImages.push({
                    id: `temp-${Date.now()}-${i}`,
                    image_url: res.url,
                    is_primary: images.length === 0 && i === 0,
                    sort_order: images.length + i,
                });
            }
            setImages([...images, ...uploadedImages]);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (id: string) => {
        const newImages = images.filter((img) => img.id !== id);
        // Ensure at least one is primary if list not empty
        if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
            newImages[0].is_primary = true;
        }
        setImages(newImages);
    };

    const makePrimary = (id: string) => {
        setImages(images.map((img) => ({
            ...img,
            is_primary: img.id === id
        })));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.findIndex((img) => img.id === active.id);
        const newIndex = images.findIndex((img) => img.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const nextImages = arrayMove(images, oldIndex, newIndex).map((img, i) => ({
                ...img,
                sort_order: i
            }));
            setImages(nextImages);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Product Media</h3>
                    <p className="text-sm text-neutral-500">Drag to reorder. The first image is the covers.</p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                    <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <SortableImageItem
                                key={img.id}
                                img={img}
                                onRemove={() => removeImage(img.id)}
                                onMakePrimary={() => makePrimary(img.id)}
                            />
                        ))}

                        {!uploading && images.length < 10 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-50 hover:border-primary-orange transition-all cursor-pointer group">
                                <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">Add Image</span>
                                <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {images.length === 0 && !uploading && (
                <div className="py-12 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center text-neutral-400">
                    <div className="p-4 bg-neutral-50 rounded-full mb-4"><ImageIcon className="w-8 h-8" /></div>
                    <p className="text-sm font-medium">No images uploaded yet</p>
                    <p className="text-xs mt-1">Add up to 10 high-quality photos</p>
                </div>
            )}
        </div>
    );
}

function SortableImageItem({ img, onRemove, onMakePrimary }: { img: ProductImage; onRemove: () => void; onMakePrimary: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative aspect-square rounded-2xl overflow-hidden border group transition-all ${isDragging ? 'opacity-50 scale-95 shadow-2xl ring-2 ring-primary-orange' : 'border-neutral-100'}`}>
            <img src={img.image_url} alt="Product" className="w-full h-full object-cover" />

            {/* Overlay Controls */}
            <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 ${isDragging ? 'hidden' : ''}`}>
                <button onClick={onRemove} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg">
                    <X className="w-4 h-4" />
                </button>
                {!img.is_primary && (
                    <button onClick={onMakePrimary} className="px-3 py-1 bg-white text-neutral-900 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors shadow-lg">
                        Cover Image
                    </button>
                )}
            </div>

            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm">
                <GripVertical className="w-4 h-4 text-neutral-600" />
            </div>

            {/* Primary Badge */}
            {img.is_primary && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary-orange text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg border border-white/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cover
                </div>
            )}

            {/* Order Badge */}
            <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center justify-center">
                {img.sort_order + 1}
            </div>
        </div>
    );
}
