'use client';

import { RotateCcw, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const returnSteps = [
    { title: 'Contact Support', description: 'Reach out to our team within 30 days of receiving your item.' },
    { title: 'Pack Safely', description: 'Repack the furniture in its original packaging or similar high-quality materials.' },
    { title: 'Schedule Pickup', description: 'Our logistics partner will schedule a convenient time for pickup.' },
    { title: 'Receive Refund', description: 'A refund will be issued once the item is inspected at our warehouse.' },
];

export default function ReturnsPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Dark Hero */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Returns & Exchanges</h1>
                    <p className="text-white/50 text-lg max-w-lg mx-auto">
                        We want you to love your furniture. If for any reason you aren&apos;t completely satisfied, our return process is straightforward and fair.
                    </p>
                </div>
            </section>

            <div className="container-wide px-6 max-w-4xl py-16">

                {/* Return Policy */}
                <div className="space-y-12 mb-20">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">30-Day Satisfaction Guarantee</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            You have 30 days from the date of delivery to initiate a return for any standard furniture piece. Whether it’s not the right fit or the style wasn&apos;t what you expected, we offer a no-questions-asked return policy for all standard designs.
                        </p>
                    </section>

                    <section className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary-orange" />
                            Exclusions
                        </h2>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Please note that <strong>fully bespoke or custom-designed</strong> pieces are non-returnable unless they arrive damaged or defective. Final sale items and floor models are also excluded from our standard return policy.
                        </p>
                    </section>
                </div>

                {/* Steps */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-8">How to Start a Return</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {returnSteps.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold mb-4">
                                    {i + 1}
                                </div>
                                <h3 className="font-bold mb-2">{step.title}</h3>
                                <p className="text-sm text-neutral-500">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Link */}
                <div className="p-8 border border-neutral-100 rounded-3xl flex items-center justify-between gap-6 hover:shadow-sm transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-primary-orange">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Need more help?</h3>
                            <p className="text-neutral-500 text-sm">Check our FAQ for detailed return information.</p>
                        </div>
                    </div>
                    <Link href="/faq" className="text-primary-orange group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
