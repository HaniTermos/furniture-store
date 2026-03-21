import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyConfig, User } from '@/types';
import { api } from '@/lib/api';

interface AppStore {
    // Currency
    currencyConfig: CurrencyConfig;
    showLbp: boolean;
    setCurrencyConfig: (config: Partial<CurrencyConfig>) => void;
    toggleCurrency: () => void;
    initializeConfig: () => Promise<void>;

    // Auth
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;

    // UI
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            // Currency
            currencyConfig: {
                usdToLbpRate: 89500,
                taxRate: 0.11,
                shippingRates: [],
                activeCurrencies: [],
                baseCurrencyCode: 'USD',
            },
            showLbp: false,
            setCurrencyConfig: (config) =>
                set({ currencyConfig: { ...get().currencyConfig, ...config } }),
            toggleCurrency: () => set({ showLbp: !get().showLbp }),

            initializeConfig: async () => {
                try {
                    const [currencies, settings] = await Promise.all([
                        api.getActiveCurrencies(),
                        api.getPublicSettings()
                    ]);

                    const lbpCurrency = currencies.find(c => c.code === 'LBP');
                    const baseCurrency = currencies.find(c => c.is_base) || currencies[0];

                    set({
                        currencyConfig: {
                            usdToLbpRate: lbpCurrency ? Number(lbpCurrency.exchange_rate) : 90000,
                            taxRate: settings.tax_rate ? Number(settings.tax_rate) : 0.11,
                            shippingRates: settings.shipping ? [
                                {
                                    id: 'default',
                                    region: 'Lebanon',
                                    minOrderValue: 0,
                                    rate: Number(settings.shipping.default_rate || 5),
                                    freeShippingThreshold: Number(settings.shipping.free_threshold || 100)
                                }
                            ] : [],
                            activeCurrencies: currencies,
                            baseCurrencyCode: baseCurrency ? baseCurrency.code : 'USD',
                        }
                    });
                } catch (error) {
                    console.error('Failed to initialize app config:', error);
                }
            },

            // Auth
            user: null,
            token: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null }),

            // UI
            isMobileMenuOpen: false,
            toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
            closeMobileMenu: () => set({ isMobileMenuOpen: false }),
        }),
        {
            name: 'htw-app',
            partialize: (state) => ({
                currencyConfig: state.currencyConfig,
                showLbp: state.showLbp,
                token: state.token,
                user: state.user,
            }),
        }
    )
);
