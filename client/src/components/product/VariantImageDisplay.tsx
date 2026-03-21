'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ChevronLeft, ChevronRight, Rotate3d, Box, Camera } from 'lucide-react';

interface VariantImageDisplayProps {
    images: { id: string; url: string; alt: string }[];
    selectedVariantImage?: string;
    productName: string;
    rotation?: number;
    isRotating?: boolean;
}

export default function VariantImageDisplay({
    images,
    selectedVariantImage,
    productName,
    rotation = 0,
    isRotating = false
}: VariantImageDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [viewMode, setViewMode] = useState<'standard' | '360' | '3D'>('standard');
    const containerRef = useRef<HTMLDivElement>(null);

    // If a variant image is selected, we override the current display
    const displayImage = selectedVariantImage || images[currentIndex]?.url || '/images/placeholder.png';

    // 360 Degree Logic: Map rotation value to image sequence index
    // We assume images contains the rotation sequence if there are more than 3 images
    const is360Capable = images.length >= 3;
    
    useEffect(() => {
        if (viewMode === '360' && is360Capable) {
            // Normalize rotation to range 0-360
            const normalizedRotation = ((rotation % 360) + 360) % 360;
            const sequenceIndex = Math.floor((normalizedRotation / 360) * images.length);
            setCurrentIndex(sequenceIndex % images.length);
        }
    }, [rotation, viewMode, is360Capable, images.length]);

    // Reset index if images change or variant selected
    useEffect(() => {
        if (!selectedVariantImage && viewMode === 'standard') {
            setCurrentIndex(0);
        }
    }, [images, selectedVariantImage, viewMode]);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    // Perspective calculation for 3D Mode
    const perspectiveRotateX = viewMode === '3D' ? (rotation % 20) / 2 : 0;
    const perspectiveRotateY = viewMode === '3D' ? rotation % 360 : 0;

    return (
        <div 
            ref={containerRef}
            className="flex flex-col gap-6 w-full relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Stage */}
            <div className={`relative aspect-[4/5] w-full bg-white rounded-2xl overflow-hidden shadow-sm group ${isRotating && viewMode !== 'standard' ? 'cursor-grabbing' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewMode === '360' ? `${displayImage}-${viewMode}` : displayImage}
                        initial={viewMode === '360' ? false : { opacity: 0, scale: 1.05 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1,
                            rotateX: perspectiveRotateX,
                            rotateY: perspectiveRotateY,
                            z: viewMode === '3D' ? 50 : 0
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                            duration: viewMode === '360' ? 0.05 : 0.6, 
                            ease: [0.2, 0.8, 0.2, 1],
                            rotateX: { type: 'spring', stiffness: 300, damping: 30 },
                            rotateY: { type: 'spring', stiffness: 300, damping: 30 }
                        }}
                        style={{ perspective: 1000 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={displayImage}
                            alt={productName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                            className="object-contain p-8 md:p-12"
                            priority
                        />
                        
                        {/* 3D Depth Shadow Simulation */}
                        {viewMode === '3D' && (
                            <div 
                                className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-black/10 blur-xl rounded-full"
                                style={{ transform: `rotateY(${-perspectiveRotateY}deg)` }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                
                {/* Navigation (Only if multiple gallery images and no variant image selected, and not in 360 mode) */}
                {images.length > 1 && !selectedVariantImage && viewMode === 'standard' && (
                    <div className={`absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-lg hover:bg-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-lg hover:bg-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* VIEW MODE CONTROLS */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <button 
                        onClick={() => setViewMode('standard')}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'standard' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-white/50'}`}
                    >
                        <Camera className="w-3 h-3" />
                        Gallery
                    </button>
                    {is360Capable && (
                        <button 
                            onClick={() => setViewMode('360')}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '360' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-white/50'}`}
                        >
                            <Rotate3d className="w-3 h-3" />
                            360°
                        </button>
                    )}
                    <button 
                        onClick={() => setViewMode('3D')}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '3D' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-white/50'}`}
                    >
                        <Box className="w-3 h-3" />
                        3D View
                    </button>
                </div>

                {/* Fullscreen Indicator */}
                <div className="absolute top-6 right-6">
                    <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all cursor-pointer">
                        <Maximize2 className="w-4 h-4" />
                    </div>
                </div>

                {/* Mode Indicator Overlay */}
                {(viewMode === '360' || viewMode === '3D') && (
                    <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="px-3 py-1 bg-primary-orange text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                            Drag to rotate {viewMode}
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails (Only in standard mode if no variant image is overriding) */}
            {viewMode === 'standard' && !selectedVariantImage && images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                currentIndex === idx 
                                ? 'border-neutral-900 scale-105 shadow-md' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
