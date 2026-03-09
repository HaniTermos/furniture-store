'use client';

import { ShieldCheck, Award, Zap, Hammer, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const warrantyItems = [
    {
        title: 'Lifetime Structural Warranty',
        icon: Hammer,
        description: 'We guarantee that the internal frames and joints of our furniture will remain structurally sound for the lifetime of the original owner.'
    },
    {
        title: '5-Year Finish Warranty',
        icon: Zap,
        description: 'Our premium oils and lacquers are protected against peeling, cracking, or significant fading for up to five years under normal use.'
    },
    {
        title: '1-Year Component Warranty',
        icon: Award,
        description: 'Moving parts like drawer glides, hinges, and integrated lighting are covered for one year from the date of delivery.'
    }
];

export default function WarrantyPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Dark Hero */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-6 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certified Protection</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Our Warranty Commitment</h1>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                        At High Tech Wood, we stand behind every piece we create. Our warranty reflects our confidence in our materials and craftsmanship.
                    </p>
                </div>
            </section>

            <div className="container-wide px-6 max-w-4xl py-16">

                <div className="grid gap-8 mb-20">
                    {warrantyItems.map((item, i) => (
                        <div key={i} className="group p-8 border border-neutral-100 rounded-3xl bg-neutral-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-orange flex-shrink-0">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-neutral-600 leading-relaxed font-medium text-sm md:text-base">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">What is Not Covered?</h2>
                        <ul className="list-disc ml-6 space-y-3 text-neutral-500 text-sm md:text-base leading-relaxed">
                            <li>Normal wear and tear typical of wooden furniture (minor scratches, etc.)</li>
                            <li>Damage caused by improper cleaning or the use of harsh chemicals.</li>
                            <li>Exposure to extreme humidity, temperature fluctuations, or direct sunlight.</li>
                            <li>Modifications made to the furniture after delivery.</li>
                            <li>Accidental damage, misuse, or commercial use (unless specified otherwise).</li>
                        </ul>
                    </section>

                    <section className="pt-8 border-t border-neutral-100">
                        <h2 className="text-2xl font-bold mb-4">How to File a Claim</h2>
                        <p className="text-neutral-600 mb-6 leading-relaxed">
                            If you believe your piece has a defect covered by our warranty, please contact our support team with your order number and photos of the issue.
                        </p>
                        <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                            File a Warranty Claim
                            <HelpCircle className="w-4 h-4" />
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
