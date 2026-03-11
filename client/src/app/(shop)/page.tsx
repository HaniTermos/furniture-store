import { Metadata } from 'next';
import HomePageClient from './page-client';

export const metadata: Metadata = {
    title: 'Home | Premium Modern Furniture',
    description: 'Transform your space with furniture that doesn\'t just fill a room — it defines it. Explore our curated collections.',
};

export default function HomePage() {
    return <HomePageClient />;
}
