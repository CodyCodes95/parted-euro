import { createContext } from "react";

interface CartContextType {
    cart: any[]
    setCart: React.Dispatch<React.SetStateAction<any[]>>
}

const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: (newCart) => void 0
});

export default CartContext;

import React, { useState } from "react";

const CartProvider: React.FC<any> = ({ children }) => {
  // Initialize an empty cart
  const [cart, setCart] = useState([]);

  // Retrieve the cart data from local storage on load
  React.useEffect(() => {
    const cartInStorage = localStorage.getItem("cart");
    if (cartInStorage) {
      setCart(JSON.parse(cartInStorage));
    }
  }, []);

  //Add the cart data to localstorage
  React.useEffect(() => {
      if (cart.length > 0) {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
  }, [cart]);


  return (
    <CartContext.Provider value={{ cart, setCart } as any}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };
