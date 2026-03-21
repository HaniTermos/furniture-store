import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductColor, ProductSize, ProductVariant } from '@/types';

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (product: Product, quantity?: number, color?: ProductColor, size?: ProductSize, variant?: ProductVariant) => void;

    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;

    // Computed
    totalItems: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1, color, size, variant) => {
                const items = get().items;
                const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}-${color?.id || 'default'}-${size?.id || 'default'}`;

                const existingItem = items.find((item) => item.id === itemId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === itemId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: itemId,
                                product,
                                quantity,
                                selectedColor: color,
                                selectedSize: size,
                                variant,

                            },
                        ],
                    });
                }
            },

            removeItem: (id) =>
                set({ items: get().items.filter((item) => item.id !== id) }),

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: () =>
                get().items.reduce((sum, item) => {
                    if (item.variant) {
                        return sum + Number(item.variant.price) * item.quantity;
                    }
                    const basePrice = Number(item.product.base_price ?? item.product.price ?? 0);
                    const sizeAdjustment = item.selectedSize?.priceAdjustment || 0;
                    return sum + (basePrice + sizeAdjustment) * item.quantity;

                }, 0),
        }),
        {
            name: 'htw-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
