import { createContext } from "react";

const CartContext = createContext({});

export default CartContext;

import React, { useState } from "react";

const CartProvider: React.FC<any> = ({ children }) => {
  // Initialize an empty cart
  const [cart, setCart] = useState([]);

  //Add the cart data to localstorage
  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Retrieve the cart data from local storage on load
  React.useEffect(() => {
    const cartInStorage = localStorage.getItem("cart");
    if (cartInStorage) {
      setCart(JSON.parse(cartInStorage));
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };
