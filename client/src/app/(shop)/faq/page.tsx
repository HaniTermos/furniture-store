'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShoppingBag, Truck, RotateCcw, CreditCard } from 'lucide-react';
import Link from 'next/link';

const faqData = [
    {
        category: 'Ordering',
        icon: ShoppingBag,
        questions: [
            { q: 'How do I place a custom order?', a: 'You can use our online configurator to customize existing designs, or contact our team directly for a fully bespoke piece of furniture.' },
            { q: 'Can I change or cancel my order?', a: 'Orders can be changed or cancelled within 24 hours of placement. After this window, production begins and changes may incur a fee.' },
            { q: 'Do you offer financing?', a: 'Yes, we partner with specialized providers to offer flexible monthly payment options at checkout.' }
        ]
    },
    {
        category: 'Shipping & Delivery',
        icon: Truck,
        questions: [
            { q: 'What is the lead time for furniture?', a: 'Standard pieces typically ship within 4-6 weeks. Custom builds may take 8-12 weeks depending on complexity.' },
            { q: 'Do you ship internationally?', a: 'Currently, we ship to the continental US and select regions in Canada. Contact us for a custom international shipping quote.' },
            { q: 'Is white-glove delivery available?', a: 'Yes, we offer premium white-glove delivery which includes room-of-choice placement and assembly.' }
        ]
    },
    {
        category: 'Returns & Warranty',
        icon: RotateCcw,
        questions: [
            { q: 'What is your return policy?', a: 'We offer a 30-day satisfaction guarantee. If you aren&apos;t happy with your piece, we&apos;ll work to make it right or process a return.' },
            { q: 'How does the warranty work?', a: 'All High Tech Wood furniture comes with a limited lifetime warranty covering structural defects and craftsmanship.' }
        ]
    }
];

function AccordionItem({ question, answer, isOpen, onClick }: any) {
    return (
        <div className="border-b border-neutral-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-primary-orange' : 'text-neutral-900 group-hover:text-primary-orange'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-orange' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-neutral-500 leading-relaxed max-w-2xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>('Ordering-0');

    return (
        <main className="bg-white min-h-screen">
            {/* Dark Hero */}
            <section className="bg-primary-black pt-28 pb-16 md:pt-32 md:pb-20">
                <div className="container-wide px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/20 text-primary-orange text-xs font-bold mb-6"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>KNOWLEDGE BASE</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Frequently Asked Questions</h1>
                    <p className="text-white/50 text-lg max-w-lg mx-auto">Everything you need to know about our products, shipping, and service.</p>
                </div>
            </section>

            <div className="container-wide px-6 py-16">

                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar Categories */}
                    <div className="hidden lg:block space-y-2">
                        {faqData.map((cat) => (
                            <button
                                key={cat.category}
                                onClick={() => {
                                    const el = document.getElementById(cat.category);
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-neutral-50 transition-colors group text-left"
                            >
                                <cat.icon className="w-5 h-5 text-neutral-400 group-hover:text-primary-orange" />
                                <span className="font-medium text-neutral-600 group-hover:text-neutral-900">{cat.category}</span>
                            </button>
                        ))}
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-3 space-y-20">
                        {faqData.map((section) => (
                            <div key={section.category} id={section.category} className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-primary-orange/10 text-primary-orange rounded-xl flex items-center justify-center">
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.category}</h2>
                                </div>
                                <div className="bg-white rounded-3xl border border-neutral-100 px-8 divide-y divide-neutral-100">
                                    {section.questions.map((item, i) => (
                                        <AccordionItem
                                            key={i}
                                            question={item.q}
                                            answer={item.a}
                                            isOpen={openIndex === `${section.category}-${i}`}
                                            onClick={() => setOpenIndex(prev => prev === `${section.category}-${i}` ? null : `${section.category}-${i}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-24 p-12 bg-neutral-900 rounded-[40px] text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                    <p className="text-neutral-400 mb-8 max-w-md mx-auto">If you can&apos;t find an answer in our FAQ, you can always contact us directly for assistance.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/contact" className="btn-primary">Contact Support</Link>
                        <a href="mailto:support@hightechwood.com" className="text-sm font-medium hover:text-primary-orange transition-colors underline decoration-primary-orange/30 underline-offset-4">support@hightechwood.com</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
