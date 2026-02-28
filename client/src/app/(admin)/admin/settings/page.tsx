'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign, Percent, Truck, Store } from 'lucide-react';
import { useAppStore } from '@/store';
import { Reveal } from '@/components/motion/Reveal';

export default function AdminSettingsPage() {
    const { currencyConfig, setCurrencyConfig } = useAppStore();
    const [rate, setRate] = useState(currencyConfig.usdToLbpRate.toString());
    const [tax, setTax] = useState((currencyConfig.taxRate * 100).toString());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setCurrencyConfig({
            usdToLbpRate: parseFloat(rate) || 89500,
            taxRate: (parseFloat(tax) || 11) / 100,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                    <p className="text-neutral-400 text-sm mt-1">Manage store configuration</p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className={`btn-primary text-sm ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                >
                    <Save className="w-4 h-4" />
                    {saved ? 'Saved!' : 'Save Changes'}
                </motion.button>
            </div>

            {/* Currency */}
            <Reveal>
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Currency Settings</h3>
                            <p className="text-sm text-neutral-400">Configure USD to LBP exchange rate</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                1 USD = ? LBP
                            </label>
                            <input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                                placeholder="89500"
                            />
                            <p className="text-xs text-neutral-400 mt-1.5">
                                Current rate: 1 USD = {parseInt(rate || '0').toLocaleString()} LBP
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* Tax */}
            <Reveal delay={0.1}>
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Percent className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Tax / VAT</h3>
                            <p className="text-sm text-neutral-400">Configure tax rate applied to orders</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Tax Rate (%)</label>
                        <input
                            type="number"
                            value={tax}
                            onChange={(e) => setTax(e.target.value)}
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                            placeholder="11"
                        />
                    </div>
                </div>
            </Reveal>

            {/* Shipping */}
            <Reveal delay={0.2}>
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Shipping Rates</h3>
                            <p className="text-sm text-neutral-400">Configure shipping costs by region</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="text-left font-medium text-neutral-400 py-2">Region</th>
                                    <th className="text-left font-medium text-neutral-400 py-2">Rate (USD)</th>
                                    <th className="text-left font-medium text-neutral-400 py-2">Free Shipping Above</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencyConfig.shippingRates.map((rate) => (
                                    <tr key={rate.id} className="border-b border-neutral-50">
                                        <td className="py-3 font-medium">{rate.region}</td>
                                        <td className="py-3">${rate.rate}</td>
                                        <td className="py-3">{rate.freeShippingThreshold ? `$${rate.freeShippingThreshold}` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Reveal>

            {/* Store Info */}
            <Reveal delay={0.3}>
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Store Information</h3>
                            <p className="text-sm text-neutral-400">Basic store details</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Store Name</label>
                            <input
                                defaultValue="High Tech Wood"
                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Contact Email</label>
                            <input
                                defaultValue="info@hightechwood.com"
                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/10 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </Reveal>
        </div>
    );
}
