import { Metadata } from 'next';
import ShopPageClient from './page-client';
import { categories } from '@/lib/data';

type Props = {
    searchParams: { category?: string; q?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const categoryQuery = searchParams.category;
    const catData = categories.find((c) => c.slug === categoryQuery);

    if (catData) {
        return {
            title: `${catData.name} | Shop Premium Furniture`,
            description: `Browse our curated collection of luxury ${catData.name.toLowerCase()}. Handcrafted for modern living.`,
        };
    }

    if (searchParams.q) {
        return {
            title: `Search: "${searchParams.q}" | Furniture Shop`,
            description: `Search results for "${searchParams.q}" in our modern furniture store.`,
        };
    }

    return {
        title: 'Shop All | Premium Modern Furniture',
        description: 'Explore our entire collection of meticulously designed modern furniture pieces. Elevate your space today.',
    };
}

export default function ShopPage({ searchParams }: Props) {
    return <ShopPageClient />;
}
