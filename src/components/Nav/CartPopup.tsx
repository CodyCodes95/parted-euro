import { useRef, useEffect, useContext } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CartContext from "../../context/cartContext";

interface CartPopupProps {
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CartItem {
  listingId: string;
  listingTitle: string;
  listingPrice: string;
  listingImage: string | undefined;
  quantity: number;
}

const CartPopup: React.FC<CartPopupProps> = ({ showCart, setShowCart }) => {

  const { cart, setCart } = useContext(CartContext);

  const popUpRef = useRef<HTMLDivElement>(null);

     const closeCart = (e:any) => {
       if (
         popUpRef.current &&
         showCart &&
         !popUpRef.current.contains(e.target)
       ) {
         setShowCart(false);
       }
     };

  useEffect(() => {
    if (showCart) {
      document.addEventListener("mousedown", closeCart);
    }
  }, [showCart]);

  return (
    <div ref={popUpRef}>
      <div
        onClick={() => setShowCart(!showCart)}
        className="cursor-pointer p-2"
      >
        <ShoppingCartIcon />
      </div>
      <div
        className={`min-h-24 absolute right-8 top-20 w-72 translate-x-[20rem] duration-150 ease-linear ${
          showCart ? "translate-x-0" : ""
        }`}
      >
        <div className="w-full max-w-md rounded-lg border bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Cart
            </h5>
          </div>
          <div className="flow-root">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {cart.length > 0 ? (
                cart.map((item, i) => (
                  <li key={i} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={item.listingImage}
                          alt="Neil image"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {item.listingTitle}
                        </p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {item.listingPrice}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <h1>No Items</h1>
              )}
            </ul>
            <button
              type="button"
              className=" mt-6 inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;
