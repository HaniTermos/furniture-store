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

<<<<<<< HEAD
=======
// ===== Variant System Types =====
export interface VariantAttribute {
    attribute_id: string;
    attribute_name: string;
    attribute_slug: string;
    option_id: string;
    option_value: string;
    option_color?: string;
    option_image?: string;
}

export interface ProductVariant {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    is_default: boolean;
    is_active: boolean;
    attributes: VariantAttribute[];
}

export interface AttributeOption {
    id: string;
    value: string;
    slug: string;
    color_hex?: string;
    image_url?: string;
}

export interface ProductAttribute {
    id: string;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'image';
    options: AttributeOption[];
}

// Configuration Option Value (from admin dashboard)
export interface ConfigOptionValue {
    id: string;
    value: string;
    price_adjustment: number;
    stock_quantity: number;
    stock_status: string;
    image_url?: string;
}

// Configuration Option (from admin dashboard)
export interface ConfigOption {
    id: string;
    name: string;
    type: string;
    values: ConfigOptionValue[];
}

>>>>>>> d1d77d0 (dashboard and variants edits)
export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
<<<<<<< HEAD
    originalPrice?: number;
=======
    base_price?: number;
    originalPrice?: number;
    original_price?: number;
>>>>>>> d1d77d0 (dashboard and variants edits)
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
<<<<<<< HEAD
=======
    stock_quantity?: number;
>>>>>>> d1d77d0 (dashboard and variants edits)
    rating: number;
    reviewCount: number;
    tags: string[];
    isNew?: boolean;
    isFeatured?: boolean;
    createdAt: string;
<<<<<<< HEAD
=======
    has_variants?: boolean;
    price_range?: { min: number; max: number };
    display_price?: string | number;
    // Variant system
    variants?: ProductVariant[];
    attributes?: ProductAttribute[];
    // Legacy configuration options from admin dashboard
    configuration_options?: ConfigOption[];
>>>>>>> d1d77d0 (dashboard and variants edits)
}

// ===== Cart Types =====
export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    selectedColor?: ProductColor;
    selectedSize?: ProductSize;
<<<<<<< HEAD
=======
    variant?: ProductVariant;
>>>>>>> d1d77d0 (dashboard and variants edits)
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
    role: 'customer' | 'admin' | 'manager' | 'super_admin';
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
