// ===== Product Types =====
export interface ProductImage {
    id: string;
    url: string;
    alt: string;
}

export interface ProductColor {
    id: string;
    name: string;
    hex: string;
    image?: string;
}

export interface ProductSize {
    id: string;
    label: string;
    priceAdjustment: number;
}

export interface ProductFeature {
    icon: string;
    title: string;
    description: string;
}

export interface ProductDetails {
    material: string;
    finish: string;
    weight: string;
    assembly: string;
    warranty: string;
    care: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    images: ProductImage[];
    colors: ProductColor[];
    sizes: ProductSize[];
    features: ProductFeature[];
    details: ProductDetails;
    category: string;
    categorySlug: string;
    category_id?: string;
    available: number;
    totalStock: number;
    rating: number;
    reviewCount: number;
    tags: string[];
    isNew?: boolean;
    isFeatured?: boolean;
    createdAt: string;
}

// ===== Cart Types =====
export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    selectedColor?: ProductColor;
    selectedSize?: ProductSize;
}

// ===== Order Types =====
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    image?: string;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    tax: number;
    shipping: number;
    totalUsd: number;
    totalLbp: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    createdAt: string;
    updatedAt: string;
}

// ===== User Types =====
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'customer' | 'admin' | 'manager';
    avatar?: string;
    createdAt: string;
}

// ===== Currency Types =====
export interface CurrencyConfig {
    usdToLbpRate: number;
    taxRate: number;
    shippingRates: ShippingRate[];
}

export interface ShippingRate {
    id: string;
    region: string;
    minOrderValue: number;
    rate: number;
    freeShippingThreshold?: number;
}

// ===== Category Types =====
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ===== Filter Types =====
export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    material?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    search?: string;
    page?: number;
    pageSize?: number;
}
