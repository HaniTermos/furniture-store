import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyConfig, User } from '@/types';

interface AppStore {
    // Currency
    currencyConfig: CurrencyConfig;
    showLbp: boolean;
    setCurrencyConfig: (config: Partial<CurrencyConfig>) => void;
    toggleCurrency: () => void;

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
                shippingRates: [
                    {
                        id: '1',
                        region: 'Lebanon',
                        minOrderValue: 0,
                        rate: 5,
                        freeShippingThreshold: 100,
                    },
                    {
                        id: '2',
                        region: 'International',
                        minOrderValue: 0,
                        rate: 25,
                        freeShippingThreshold: 500,
                    },
                ],
            },
            showLbp: false,
            setCurrencyConfig: (config) =>
                set({ currencyConfig: { ...get().currencyConfig, ...config } }),
            toggleCurrency: () => set({ showLbp: !get().showLbp }),

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
