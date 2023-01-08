import { createContext, Context } from "react";

interface Cart {
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    listingImage: string;
    listingQuantity: number;
}

interface CartContextType {
  cart: Cart[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
}

const CartContext: Context<CartContextType> = createContext<CartContextType>({
  cart:  [],
  setCart: () => {},
});

export default CartContext;
