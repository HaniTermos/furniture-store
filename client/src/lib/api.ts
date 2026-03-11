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

// Custom error class to carry structured validation errors
export class ApiError extends Error {
    errors?: Record<string, string>;
    status: number;
    constructor(message: string, status: number, errors?: Record<string, string>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
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
            // Try to parse a JSON body with field-level errors
            let body: any = null;
            try { body = await res.json(); } catch {}

            const message = body?.error || body?.message || `API Error: ${res.statusText}`;
            const fieldErrors = body?.errors; // { fieldName: "message" }
            throw new ApiError(message, res.status, fieldErrors);
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

    async getAdminCategoriesTree(): Promise<any[]> {
        return this.fetch<any[]>('/admin/categories/tree');
    }

    // Tags
    async getAdminTags(): Promise<any[]> {
        return this.fetch<any[]>('/admin/tags');
    }

    // Attributes
    async getAdminAttributes(): Promise<any[]> {
        return this.fetch<any[]>('/admin/attributes');
    }

    // Size Guides
    async getAdminSizeGuides(): Promise<any[]> {
        return this.fetch<any[]>('/admin/size-guides');
    }

    async createSizeGuide(data: any): Promise<any> {
        return this.fetch<any>('/admin/size-guides', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateSizeGuide(id: string, data: any): Promise<any> {
        return this.fetch<any>(`/admin/size-guides/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteSizeGuide(id: string): Promise<any> {
        return this.fetch<any>(`/admin/size-guides/${id}`, {
            method: 'DELETE'
        });
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

    // ─── Admin Analytics ────────────────────────────────────
    async getAdminSalesAnalytics(period?: string): Promise<any> {
        return this.fetch<any>(`/admin/analytics/sales${period ? `?period=${period}` : ''}`);
    }

    // ─── Admin Orders ───────────────────────────────────────
    async getAdminOrders(params?: Record<string, string | number>): Promise<any> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/orders${qs}`);
    }

    async getAdminOrderDetail(id: string): Promise<any> {
        return this.fetch<any>(`/admin/orders/${id}`);
    }

    async updateOrderStatus(id: string, data: { status: string; trackingNumber?: string; notes?: string }): Promise<any> {
        return this.fetch<any>(`/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // ─── Admin Customers ────────────────────────────────────
    async getAdminCustomers(params?: Record<string, string | number>): Promise<any> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/customers${qs}`);
    }

    async getAdminCustomerDetail(id: string): Promise<any> {
        return this.fetch<any>(`/admin/customers/${id}`);
    }

    // ─── Admin Products (via new admin routes) ──────────────
    async getAdminProducts(params?: Record<string, string | number>): Promise<any> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/products${qs}`);
    }

    async getAdminProductDetail(id: string): Promise<any> {
        return this.fetch<any>(`/admin/products/${id}`);
    }

    async adminCreateProduct(data: any): Promise<any> {
        return this.fetch<any>('/admin/products', { method: 'POST', body: JSON.stringify(data) });
    }

    async adminUpdateProduct(id: string, data: any): Promise<any> {
        return this.fetch<any>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async adminDeleteProduct(id: string): Promise<any> {
        return this.fetch<any>(`/admin/products/${id}`, { method: 'DELETE' });
    }

    async adminDuplicateProduct(id: string): Promise<any> {
        return this.fetch<any>(`/admin/products/${id}/duplicate`, { method: 'POST' });
    }

    async adminBulkDeleteProducts(ids: string[]): Promise<any> {
        return this.fetch<any>('/admin/products/bulk-delete', { method: 'POST', body: JSON.stringify({ productIds: ids }) });
    }

    // ─── Coupons ────────────────────────────────────────────
    async getAdminCoupons(params?: Record<string, string | number>): Promise<any> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/coupons${qs}`);
    }

    async createCoupon(data: any): Promise<any> {
        return this.fetch<any>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateCoupon(id: string, data: any): Promise<any> {
        return this.fetch<any>(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteCoupon(id: string): Promise<any> {
        return this.fetch<any>(`/admin/coupons/${id}`, { method: 'DELETE' });
    }

    // ─── Inventory ──────────────────────────────────────────
    async getAdminLowStock(threshold?: number): Promise<any> {
        return this.fetch<any>(`/admin/inventory/low-stock${threshold ? `?threshold=${threshold}` : ''}`);
    }

    async adjustStock(data: { valueId: string; adjustment: number; reason: string }): Promise<any> {
        return this.fetch<any>('/admin/inventory/adjust', { method: 'POST', body: JSON.stringify(data) });
    }

    // ─── Staff ──────────────────────────────────────────────
    async getAdminStaff(): Promise<any> {
        return this.fetch<any>('/admin/users');
    }

    async createStaff(data: any): Promise<any> {
        return this.fetch<any>('/admin/users', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateStaffRole(id: string, role: string): Promise<any> {
        return this.fetch<any>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    }

    async toggleStaffStatus(id: string, is_active: boolean): Promise<any> {
        return this.fetch<any>(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ is_active }) });
    }

    async deleteStaff(id: string): Promise<any> {
        return this.fetch<any>(`/admin/users/${id}`, { method: 'DELETE' });
    }

    // ─── Activity Logs ──────────────────────────────────────
    async getAdminActivityLogs(params?: Record<string, string | number>): Promise<any> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/activity-logs${qs}`);
    }

    // ─── Auth Extensions ────────────────────────────────────
    async logout(): Promise<any> {
        return this.fetch<any>('/auth/logout', { method: 'POST' });
    }

    async verifyEmail(token: string): Promise<any> {
        return this.fetch<any>(`/auth/verify-email?token=${token}`);
    }

    async forgotPassword(email: string): Promise<any> {
        return this.fetch<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    }

    async resetPassword(token: string, password: string): Promise<any> {
        return this.fetch<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
    }

    async resendVerification(email: string): Promise<any> {
        return this.fetch<any>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
    }

    // ─── Image Upload (FormData) ────────────────────────────
    async adminUploadImage(formData: FormData): Promise<any> {
        const token = useAppStore.getState().token;
        const res = await fetch(`${API_URL}/admin/upload/image`, {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: formData,
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }

    async adminUploadImages(formData: FormData): Promise<any> {
        const token = useAppStore.getState().token;
        const res = await fetch(`${API_URL}/admin/upload/images`, {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: formData,
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }

    // Reviews
    async getProductReviews(productId: string, params?: { page?: number; limit?: number }): Promise<{ reviews: any[], total: number, page: number, totalPages: number, averageRating?: number }> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/reviews/${productId}${queryString}`);
    }

    async createReview(data: { product_id: string; rating: number; title: string; comment: string }): Promise<{ message: string, review: any }> {
        return this.fetch<any>('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Admin Reviews
    async getAdminReviews(params?: { page?: number; limit?: number; is_approved?: boolean }): Promise<{ reviews: any[] }> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/reviews${qs}`);
    }

    async approveReview(id: string): Promise<any> {
        return this.fetch<any>(`/admin/reviews/${id}/approve`, { method: 'PUT' });
    }

    async replyToReview(id: string, reply: string): Promise<any> {
        return this.fetch<any>(`/admin/reviews/${id}/reply`, {
            method: 'PUT',
            body: JSON.stringify({ reply })
        });
    }

    async toggleReviewFeatured(id: string): Promise<any> {
        return this.fetch<any>(`/admin/reviews/${id}/featured`, { method: 'PUT' });
    }

    async deleteReview(id: string): Promise<any> {
        return this.fetch<any>(`/admin/reviews/${id}`, { method: 'DELETE' });
    }

    // Admin Contact Messages
    async getAdminMessages(params?: { page?: number; limit?: number; status?: string }): Promise<{ messages: any[], total: number }> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/messages${qs}`);
    }

    async getAdminMessageDetail(id: string): Promise<any> {
        return this.fetch<any>(`/admin/messages/${id}`);
    }

    async replyToMessage(id: string, reply: string): Promise<any> {
        return this.fetch<any>(`/admin/messages/${id}/reply`, {
            method: 'PUT',
            body: JSON.stringify({ reply })
        });
    }

    async deleteMessage(id: string): Promise<any> {
        return this.fetch<any>(`/admin/messages/${id}`, { method: 'DELETE' });
    }

    // Admin Notifications
    async getNotifications(params?: { limit?: number; onlyUnread?: boolean }): Promise<{ notifications: any[], unreadCount: number }> {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.fetch<any>(`/admin/notifications${qs}`);
    }

    async markNotificationRead(id: string): Promise<any> {
        return this.fetch<any>(`/admin/notifications/${id}/read`, { method: 'PUT' });
    }

    async clearNotifications(): Promise<any> {
        return this.fetch<any>('/admin/notifications/clear', { method: 'PUT' });
    }

    // Site Settings
    async getSettings(): Promise<any> {
        return this.fetch<any>('/admin/settings');
    }

    async updateSetting(key: string, value: any): Promise<any> {
        return this.fetch<any>('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify({ key, value })
        });
    }

    // Currencies
    async getCurrencies(): Promise<any> {
        return this.fetch<any>('/admin/currencies');
    }

    async createCurrency(data: any): Promise<any> {
        return this.fetch<any>('/admin/currencies', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateCurrency(id: string, data: any): Promise<any> {
        return this.fetch<any>(`/admin/currencies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteCurrency(id: string): Promise<any> {
        return this.fetch<any>(`/admin/currencies/${id}`, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
