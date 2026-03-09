import { Product, ProductColor, ProductSize, ProductImage } from '@/types';
import { useAppStore } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Transform backend product to frontend shape
export function transformProduct(p: any): Product {
    // Try to parse configure data if included, otherwise provide sensible defaults
    const images = (p.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt_text || p.name
    }));

    if (images.length === 0 && p.primary_image) {
        images.push({ id: 'primary', url: p.primary_image, alt: p.name });
    }

    const colors = (p.configuration_options?.find((o: any) => o.type === 'color')?.values || []).map((v: any) => {
        // We stored 'Name|#HEX' in seed
        const [name, hex] = (v.value || '').split('|');
        return {
            id: v.id,
            name: name || v.value,
            hex: hex || '#CCCCCC',
            image: v.image_url
        };
    });

    const sizes = (p.configuration_options?.find((o: any) => o.type === 'size')?.values || []).map((v: any) => ({
        id: v.id,
        label: v.value,
        priceAdjustment: Number(v.price_adjustment || 0)
    }));

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        shortDescription: p.short_description || '',
        price: Number(p.base_price),
        originalPrice: undefined,
        category: p.category_name || '',
        categorySlug: p.category_slug || '',
        category_id: p.category_id || '',
        available: 10,
        totalStock: 50,
        rating: Number(p.avg_rating) || 4.5,
        reviewCount: Number(p.review_count) || 0,
        tags: [],
        details: {
            material: 'See description',
            finish: 'Standard',
            weight: p.weight_kg ? p.weight_kg + ' kg' : 'N/A',
            assembly: 'Check details',
            warranty: 'Standard',
            care: 'Standard care'
        },
        features: [],
        colors: colors.length ? colors : [{ id: 'default', name: 'Standard', hex: '#CCCCCC' }],
        sizes: sizes.length ? sizes : [{ id: 'default', label: 'Standard', priceAdjustment: 0 }],
        images,
        createdAt: p.created_at
    };
}

class ApiClient {
    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = useAppStore.getState().token;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        return res.json();
    }

    async getProducts(params?: Record<string, string | number>): Promise<{ products: Product[], total: number, page: number, totalPages: number }> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        const res = await this.fetch<any>(`/products${queryString}`);
        return {
            ...res,
            products: (res.products || []).map(transformProduct)
        };
    }

    async getFeaturedProducts(limit = 8): Promise<{ products: Product[] }> {
        const res = await this.fetch<any>(`/products/featured?limit=${limit}`);
        return {
            products: (res.products || []).map(transformProduct)
        };
    }

    async getProductBySlug(slug: string): Promise<{ product: Product, reviews: any[], relatedProducts: Product[] }> {
        const res = await this.fetch<any>(`/products/${slug}`);
        return {
            ...res,
            product: transformProduct(res.product),
            relatedProducts: (res.relatedProducts || []).map(transformProduct)
        };
    }

    // Auth
    async login(credentials: { email: string; password: string }): Promise<{ token: string, user: any, message: string }> {
        const res = await this.fetch<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return res;
    }

    async register(data: { name: string; email: string; password: string }): Promise<{ token: string, user: any, message: string }> {
        const res = await this.fetch<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res;
    }

    // Admin Dashboard
    async getAdminDashboard(): Promise<any> {
        return this.fetch<any>('/admin/dashboard');
    }

    // Admin Products CRUD
    async createProduct(data: any): Promise<{ message: string, product: any }> {
        return this.fetch<any>('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProduct(id: string, data: any): Promise<{ message: string, product: any }> {
        return this.fetch<any>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProduct(id: string): Promise<{ message: string }> {
        return this.fetch<any>(`/products/${id}`, {
            method: 'DELETE',
        });
    }

    // Categories
    async getCategories(): Promise<any[]> {
        return this.fetch<any[]>('/categories');
    }

    // Admin Users Management
    async getUsers(): Promise<any> {
        return this.fetch<any>('/users');
    }

    async updateUserRole(id: string, role: 'customer' | 'manager' | 'admin'): Promise<any> {
        return this.fetch<any>(`/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async updateUserStatus(id: string, is_active: boolean): Promise<any> {
        return this.fetch<any>(`/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ is_active })
        });
    }

    // Invitations
    async inviteUser(data: { email: string; name: string; role: string }): Promise<any> {
        return this.fetch<any>('/invitations/invite', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async verifyInvitation(token: string): Promise<any> {
        return this.fetch<any>(`/invitations/verify/${token}`);
    }

    async acceptInvitation(data: { token: string; password: string }): Promise<any> {
        return this.fetch<any>('/invitations/accept', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Product images
    async uploadProductImage(productId: string, formData: FormData): Promise<any> {
        const token = useAppStore.getState().token;
        const res = await fetch(`${API_URL}/products/${productId}/images`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        return res.json();
    }

    // Configuration Options (Swatches)
    async createConfigurationOption(data: { product_id: string; name: string; type: string; is_required?: boolean; sort_order?: number }): Promise<any> {
        return this.fetch<any>('/admin/config-options', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createConfigurationValue(data: { option_id: string; value: string; price_adjustment?: number; image_url?: string }): Promise<any> {
        return this.fetch<any>('/admin/config-values', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient();
