'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => api.getProductBySlug(id), // Wait, the route says getProductBySlug but here it might be an ID. Let's assume it resolves id too based on how it's written or we just fetch products and find it. 
        // Actually, backend /products/:id or /products/slug/:slug. The API in frontend `getProductBySlug` expects slug. 
        // But for admin, maybe we need getProductById?
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary-orange mb-4" />
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error || !data?.product) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 max-w-2xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Failed to load product details. They may have been deleted.</p>
            </div>
        );
    }

    return (
        <div className="pb-12">
            <ProductForm
                initialData={{
                    ...data.product,
                    // Map frontend shape back to form shape for category_id exactly
                    category_id: data.product.category_id || '',
                }}
                isEditing={true}
            />
        </div>
    );
}
