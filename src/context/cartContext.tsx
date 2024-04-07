import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect } from "react";
import { useState } from "react";

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  emptyCart: () => void;
}

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

const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => void 0,
  emptyCart: () => void 0,
});

export const useCart = () => {
  return useContext(CartContext);
};

const CartProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Initialize an empty cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartSet, setCartSet] = useState(false);

  const emptyCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  useEffect(() => {
    setCart(
      localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart")!)
        : [],
    );
    setCartSet(true);
  }, []);

  //Add the cart data to localstorage
  useEffect(() => {
    if (!cartSet) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart, emptyCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };
