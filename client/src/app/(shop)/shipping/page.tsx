'use client';

import { Truck, Clock, Globe, ShieldCheck } from 'lucide-react';

const policies = [
    {
        title: 'Shipping Rates & Methods',
        icon: Truck,
        content: `
            <p>We offer competitive shipping rates based on the size and weight of your furniture. Most standard items ship via FedEx, UPS, or specialized furniture carriers. White-glove delivery is available for all large furniture pieces.</p>
            <ul class="list-disc ml-6 mt-4 space-y-2 text-neutral-500">
                <li>Standard Ground: $49 - $149 (based on weight)</li>
                <li>Threshold Delivery: $199</li>
                <li>White Glove Service: $299 (includes assembly)</li>
            </ul>
        `
    },
    {
        title: 'Delivery Times',
        icon: Clock,
        content: `
            <p>Each piece of furniture is handcrafted to order. Our estimated delivery times are as follows:</p>
            <ul class="list-disc ml-6 mt-4 space-y-2 text-neutral-500">
                <li>Production Lead Time: 4-8 weeks</li>
                <li>Transit Time: 5-10 business days</li>
                <li>Total estimated time: 6-10 weeks</li>
            </ul>
        `
    },
    {
        title: 'International Shipping',
        icon: Globe,
        content: `
            <p>Currently, we ship to all 48 contiguous US states and select Canadian provinces. If you reside outside these areas, please contact our support team to discuss custom shipping arrangements and international quotes.</p>
        `
    }
];

export default function ShippingPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Dark Hero */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Shipping Information</h1>
                    <p className="text-white/50 text-lg max-w-lg mx-auto">
                        We are committed to delivering your furniture safely and efficiently. Learn more about our delivery process, rates, and timelines.
                    </p>
                </div>
            </section>

            <div className="container-wide px-6 max-w-4xl py-16">

                <div className="space-y-16">
                    {policies.map((policy, i) => (
                        <div key={i} className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-primary-orange group-hover:bg-primary-orange/10 transition-colors">
                                    <policy.icon className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">{policy.title}</h2>
                            </div>
                            <div
                                className="text-neutral-600 leading-relaxed prose prose-neutral max-w-none"
                                dangerouslySetInnerHTML={{ __html: policy.content }}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 border border-neutral-100 rounded-3xl bg-neutral-50 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm flex-shrink-0">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Insurance & Protection</h3>
                        <p className="text-neutral-500 text-sm">All shipments are fully insured against damage during transit. If your item arrives with any issues, we will repair or replace it at no cost to you.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
