import { Metadata } from 'next';
import AboutPageClient from './page-client';

export const metadata: Metadata = {
    title: 'About Us | Our Story & Craft',
    description: 'Redefining modern living through sustainable craftsmanship and timeless design since 2018.',
};

export default function AboutPage() {
    return <AboutPageClient />;
}
