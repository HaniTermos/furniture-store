import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                if (!currentItems.find(i => i.id === product.id)) {
                    set({ items: [...currentItems, product] });
                }
            },
            removeItem: (productId) => set({
                items: get().items.filter(i => i.id !== productId)
            }),
            isInWishlist: (productId) => !!get().items.find(i => i.id === productId)
        }),
        {
            name: 'htw-wishlist',
        }
    )
);
