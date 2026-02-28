'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SimplePlaceholderPage({ title }: { title: string }) {
    return (
        <>
            <div className="h-20" />
            <section className="py-32 text-center container-wide section-padding">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                <p className="text-neutral-500 text-lg mb-8 max-w-xl mx-auto">
                    This page is currently under development. Please check back later!
                </p>
                <Link href="/" className="btn-primary inline-flex">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </section>
        </>
    );
}
