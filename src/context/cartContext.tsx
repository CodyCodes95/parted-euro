import type { PropsWithChildren} from "react";
import { createContext, useContext, useEffect } from "react";
import  { useState } from "react";

interface CartContextType {
    cart: CartItem[]
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
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
};

const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => void 0
});

export const useCart = () => {
  return useContext(CartContext)
}



const CartProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Initialize an empty cart
  const [cart, setCart] = useState(localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")!) : []);

  //Add the cart data to localstorage
  useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };
