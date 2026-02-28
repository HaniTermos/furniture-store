import { Product, Category } from '@/types';

export const categories: Category[] = [
    {
        id: '1',
        name: 'Living Room',
        slug: 'living-room',
        description: 'Sofas, chairs, and tables for your living space',
        image: '/images/categories/living-room.jpg',
        productCount: 24,
    },
    {
        id: '2',
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Beds, nightstands, and dressers',
        image: '/images/categories/bedroom.jpg',
        productCount: 18,
    },
    {
        id: '3',
        name: 'Dining',
        slug: 'dining',
        description: 'Tables, chairs, and buffets',
        image: '/images/categories/dining.jpg',
        productCount: 15,
    },
    {
        id: '4',
        name: 'Office',
        slug: 'office',
        description: 'Desks, office chairs, and shelving',
        image: '/images/categories/office.jpg',
        productCount: 12,
    },
];

export const products: Product[] = [
    {
        id: '1',
        slug: 'luna-liven-lounge-chair',
        name: 'Luna Liven Lounge Chair',
        description:
            'The Luna Lounge Chair is designed to invite rest and pause. With soft, curved edges and a solid ash wood frame, it fits seamlessly into small living spaces, reading corners, or bedrooms.',
        shortDescription: 'Soft curves meet timeless design.',
        price: 110,
        originalPrice: 139,
        images: [
            { id: '1', url: '/images/products/chair-orange-1.png', alt: 'Luna Chair - Orange Front' },
            { id: '2', url: '/images/products/chair-orange-2.png', alt: 'Luna Chair - Orange Side' },
            { id: '3', url: '/images/products/chair-orange-3.png', alt: 'Luna Chair - Orange Back' },
            { id: '4', url: '/images/products/chair-black-1.png', alt: 'Luna Chair - Black' },
            { id: '5', url: '/images/products/chair-green-1.png', alt: 'Luna Chair - Green' },
            { id: '6', url: '/images/products/chair-gray-1.png', alt: 'Luna Chair - Gray' },
        ],
        colors: [
            { id: 'orange', name: 'Sunset Orange', hex: '#F97316', image: '/images/products/chair-orange-1.png' },
            { id: 'light-blue', name: 'Sky Blue', hex: '#BFDBFE' },
            { id: 'sage', name: 'Sage Green', hex: '#A3B18A', image: '/images/products/chair-green-1.png' },
            { id: 'charcoal', name: 'Charcoal', hex: '#374151', image: '/images/products/chair-black-1.png' },
            { id: 'blush', name: 'Blush', hex: '#D4A59A' },
        ],
        sizes: [
            { id: 'standard', label: 'Standard', priceAdjustment: 0 },
            { id: 'large', label: 'Large', priceAdjustment: 30 },
        ],
        features: [
            { icon: 'curves', title: 'Gentle Curves', description: 'Gentle curves that soften any space' },
            { icon: 'compact', title: 'Compact Size', description: 'Compact size, ideal for small apartments' },
            { icon: 'breathable', title: 'Breathable Fabric', description: 'Breathable fabric for all-season comfort' },
            { icon: 'sustainable', title: 'Sustainably Sourced', description: 'Crafted from sustainably sourced log' },
        ],
        details: {
            material: 'Solid ash wood, foam cushioning, woven linen blend',
            finish: 'Calm cozy orange with natural wood finish',
            weight: '11.5 kg',
            assembly: 'Partial assembly required (tools included)',
            warranty: '2 years',
            care: 'Spot clean with mild detergent, avoid direct sunlight',
        },
        category: 'Living Room',
        categorySlug: 'living-room',
        available: 13,
        totalStock: 100,
        rating: 4.8,
        reviewCount: 142,
        tags: ['bestseller', 'new-arrival'],
        isNew: true,
        isFeatured: true,
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        slug: 'harmony-dining-table',
        name: 'Harmony Dining Table',
        description:
            'A beautifully simple dining table crafted from solid oak with tapered steel legs. Seats up to 6 comfortably.',
        shortDescription: 'Minimalist dining perfection.',
        price: 320,
        originalPrice: 399,
        images: [
            { id: '1', url: '/images/products/table-1.png', alt: 'Harmony Table - Front' },
        ],
        colors: [
            { id: 'natural', name: 'Natural Oak', hex: '#C49A6C' },
            { id: 'walnut', name: 'Dark Walnut', hex: '#5C4033' },
        ],
        sizes: [
            { id: '4-seat', label: '4 Seat', priceAdjustment: 0 },
            { id: '6-seat', label: '6 Seat', priceAdjustment: 80 },
        ],
        features: [
            { icon: 'curves', title: 'Elegant Design', description: 'Clean lines with tapered legs' },
            { icon: 'sustainable', title: 'Solid Oak', description: 'Premium solid oak construction' },
            { icon: 'compact', title: 'Space Efficient', description: 'Compact footprint, max seating' },
            { icon: 'breathable', title: 'Easy Care', description: 'Stain-resistant finish' },
        ],
        details: {
            material: 'Solid oak, powder-coated steel',
            finish: 'Natural matte oil',
            weight: '35 kg',
            assembly: 'Legs attach with included bolts',
            warranty: '5 years',
            care: 'Wipe with damp cloth',
        },
        category: 'Dining',
        categorySlug: 'dining',
        available: 8,
        totalStock: 50,
        rating: 4.9,
        reviewCount: 87,
        tags: ['popular'],
        isFeatured: true,
        createdAt: '2024-02-01',
    },
    {
        id: '3',
        slug: 'serene-bookshelf',
        name: 'Serene Bookshelf',
        description:
            'Open-concept bookshelf with asymmetric shelving. Perfect for displaying books, plants, and decorative objects.',
        shortDescription: 'Display with character.',
        price: 189,
        images: [
            { id: '1', url: '/images/products/shelf-1.png', alt: 'Serene Bookshelf' },
        ],
        colors: [
            { id: 'white', name: 'Cloud White', hex: '#F5F5F5' },
            { id: 'black', name: 'Matte Black', hex: '#1A1A1A' },
        ],
        sizes: [
            { id: 'small', label: 'Small (4 shelf)', priceAdjustment: 0 },
            { id: 'tall', label: 'Tall (6 shelf)', priceAdjustment: 60 },
        ],
        features: [
            { icon: 'curves', title: 'Asymmetric Design', description: 'Unique asymmetric layout' },
            { icon: 'compact', title: 'Wall Friendly', description: 'Slim profile, wall-mountable' },
            { icon: 'sustainable', title: 'Recycled MDF', description: 'Made from recycled materials' },
            { icon: 'breathable', title: 'Modular', description: 'Stackable for custom configurations' },
        ],
        details: {
            material: 'Recycled MDF, steel brackets',
            finish: 'Matte lacquer',
            weight: '18 kg',
            assembly: 'Full assembly required (~30 min)',
            warranty: '3 years',
            care: 'Dust regularly, avoid heavy impacts',
        },
        category: 'Living Room',
        categorySlug: 'living-room',
        available: 22,
        totalStock: 75,
        rating: 4.6,
        reviewCount: 54,
        tags: ['new-arrival'],
        isNew: true,
        isFeatured: true,
        createdAt: '2024-03-10',
    },
    {
        id: '4',
        slug: 'cloud-armchair',
        name: 'Cloud Armchair',
        description:
            'Sink into the Cloud Armchair. Its deep seat, plush cushioning, and clean silhouette will transform any corner into a cozy retreat.',
        shortDescription: 'Ultimate comfort, minimal form.',
        price: 249,
        originalPrice: 299,
        images: [
            { id: '1', url: '/images/products/armchair-1.png', alt: 'Cloud Armchair - White' },
        ],
        colors: [
            { id: 'cream', name: 'Cream', hex: '#FFFDD0' },
            { id: 'slate', name: 'Slate Gray', hex: '#6B7280' },
            { id: 'forest', name: 'Forest Green', hex: '#2D5016' },
        ],
        sizes: [
            { id: 'standard', label: 'Standard', priceAdjustment: 0 },
        ],
        features: [
            { icon: 'curves', title: 'Deep Seat', description: 'Extra-deep seat for ultimate relaxation' },
            { icon: 'breathable', title: 'Premium Fabric', description: 'Soft-touch premium upholstery' },
            { icon: 'compact', title: 'Lightweight', description: 'Easy to move and rearrange' },
            { icon: 'sustainable', title: 'Durable Frame', description: 'Solid hardwood frame' },
        ],
        details: {
            material: 'Hardwood frame, high-density foam, linen blend',
            finish: 'Natural linen texture',
            weight: '22 kg',
            assembly: 'No assembly required',
            warranty: '3 years',
            care: 'Professional clean recommended',
        },
        category: 'Living Room',
        categorySlug: 'living-room',
        available: 5,
        totalStock: 30,
        rating: 4.7,
        reviewCount: 93,
        tags: ['bestseller'],
        isFeatured: true,
        createdAt: '2024-01-20',
    },
];

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
    return products.filter((p) => p.isFeatured);
}

export function getProductsByCategory(categorySlug: string): Product[] {
    return products.filter((p) => p.categorySlug === categorySlug);
}
