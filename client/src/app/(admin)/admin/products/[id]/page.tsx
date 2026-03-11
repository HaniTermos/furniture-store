'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit, Package, ShoppingCart, Tag, Activity, Archive, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function AdminProductViewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const productId = params.id;

    const { data, isLoading } = useQuery({
        queryKey: ['admin-product', productId],
        queryFn: () => api.getAdminProductDetail(productId),
        enabled: !!productId && productId !== 'undefined',
    });

    if (isLoading) return <div className="p-8"><div className="w-full h-64 bg-neutral-100 rounded-2xl animate-pulse" /></div>;

    const p = data?.product;
    if (!p) return <div className="p-12 text-center text-neutral-500">Product not found</div>;

    const images = p.images || (p.primary_image ? [{ image_url: p.primary_image }] : []);
    const stockTotal = p.configurations?.reduce((sum: number, c: any) => sum + (c.stock_quantity || 0), 0) || 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 font-mono mt-1">SKU: {p.sku || 'N/A'}</p>
                    </div>
                </div>
                <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                    <Edit className="w-4 h-4" /> Edit Product
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-neutral-100 bg-white flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Tag className="w-5 h-5" /></div>
                    <div><p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Price</p><p className="text-xl font-bold">${Number(p.base_price).toFixed(2)}</p></div>
                </div>
                <div className="p-4 rounded-xl border border-neutral-100 bg-white flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Archive className="w-5 h-5" /></div>
                    <div><p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Total Stock</p><p className="text-xl font-bold">{stockTotal}</p></div>
                </div>
                <div className="p-4 rounded-xl border border-neutral-100 bg-white flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><ShoppingCart className="w-5 h-5" /></div>
                    <div><p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Sales (All Time)</p><p className="text-xl font-bold">142</p></div>
                </div>
                <div className="p-4 rounded-xl border border-neutral-100 bg-white flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                    <div><p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Views (30d)</p><p className="text-xl font-bold">1.2K</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Images & Description */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden p-6 space-y-6">
                        {/* Media Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {images.length > 0 ? (
                                <div className="md:col-span-2 relative aspect-video bg-neutral-100 rounded-xl overflow-hidden shadow-sm">
                                    <Image src={images[0]?.image_url} alt={p.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="md:col-span-2 h-64 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">No images uploaded</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Description</h3>
                            <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                {p.description || 'No description provided.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Variants, Categories */}
                <div className="space-y-6">
                    {/* Organization Container */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="font-semibold flex items-center gap-2"><Package className="w-4 h-4" /> Category</h3>
                        </div>
                        <div className="p-6">
                            {p.category_name ? (
                                <span className="inline-block px-3 py-1 bg-neutral-100 rounded-lg text-sm font-medium">{p.category_name}</span>
                            ) : (
                                <span className="text-sm text-neutral-500">Uncategorized</span>
                            )}
                        </div>
                    </div>

                    {/* Stock & Variations */}
                    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2"><Archive className="w-4 h-4" /> Variations Details</h3>
                        </div>
                        <div className="p-0">
                            {(!p.configurations || p.configurations.length === 0) ? (
                                <div className="p-6 text-center text-sm text-neutral-500">No variations configured for this product.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Variant</th>
                                            <th className="px-6 py-3">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {p.configurations.map((cfg: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 text-neutral-700">
                                                    <span className="text-neutral-500 capitalize">{cfg.option_name}:</span> <span className="font-medium">{cfg.value}</span>
                                                    {parseFloat(cfg.price_adjustment) > 0 && <span className="ml-2 text-xs text-primary-orange">(+${parseFloat(cfg.price_adjustment).toFixed(2)})</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded font-bold ${cfg.stock_quantity <= 3 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {cfg.stock_quantity || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
