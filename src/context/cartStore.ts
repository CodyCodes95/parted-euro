import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string | undefined;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  itemVin: string;
};

type CartStore = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  emptyCart: () => void;
  removeItemFromCart: (id: string) => void;
};

export const useCartStore = create(
  persist<CartStore>(
    (set) => ({
      cart: [],
      setCart: (cart: CartItem[]) => set({ cart }),
      emptyCart: () => set({ cart: [] }),
      removeItemFromCart: (id: string) => {
        set((cartStore) => ({
          cart: cartStore.cart.filter((item) => item.listingId !== id),
        }));
      },
    }),
    {
      name: "cart", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
