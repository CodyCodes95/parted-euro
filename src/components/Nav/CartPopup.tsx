import { useRef, useEffect, useContext, useState } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CartContext from "../../context/cartContext";
import { formatPrice } from "../../utils/formatPrice";
import Badge from "@mui/material/Badge";
import Link from "next/link";
import { useRouter } from "next/router";

interface CartPopupProps {
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CartItem {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string | undefined;
  quantity: number;
}

const CartPopup: React.FC<CartPopupProps> = ({ showCart, setShowCart }) => {
  const { cart, setCart } = useContext(CartContext);

  const router = useRouter();

  const [shipping, setShipping] = useState<number>(0);

  const popUpRef = useRef<HTMLDivElement>(null);

  const closeCart = (e: any) => {
    if (popUpRef.current && showCart && !popUpRef.current.contains(e.target)) {
      setShowCart(false);
    }
  };

  const removeItemFromCart = (id: string) => {
    const updatedCart = cart.filter((i) => i.listingId !== id);
    setCart(updatedCart);
  };

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      setShowCart(false);
    });
  }, []);

  const updateQuantity = (e: any, item: CartItem) => {
    const updatedCart = cart.map((listing) => {
      // handle updating qnt to 0, exceeding available qnt on listings etc
      // if (listing.listingId === item.listingId) {
      //     if (listing.quantity)
      // } else {
      //   return listing;
      // }
      return listing.listingId === item.listingId
        ? {
            ...listing,
            quantity:
              e.target.textContent === "+"
                ? (item.quantity += 1)
                : (item.quantity -= 1),
          }
        : listing;
    });
    setCart(updatedCart);
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
        <Badge badgeContent={cart.length} color="error">
          <ShoppingCartIcon />
        </Badge>
      </div>

      <div
        className={`absolute right-0 z-[150] w-[40rem] translate-y-[2rem] translate-x-0 rounded-md bg-white px-4 py-6 shadow-md duration-200 ease-linear sm:px-8 sm:py-10 ${
          !showCart ? "translate-x-[40rem]" : ""
        }`}
      >
        {cart.length > 0 ? (
          <>
            <div className="flow-root">
              <ul className="-my-8">
                {cart.map((item: CartItem) => (
                  <li
                    key={item.listingId}
                    className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                  >
                    <div className="shrink-0">
                      <img
                        className="h-24 w-24 max-w-full rounded-lg object-cover"
                        src={item.listingImage}
                        alt=""
                      />
                    </div>

                    <div className="relative flex flex-1 flex-col justify-between">
                      <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
                        <div className="pr-8 sm:pr-5">
                          <p className="text-base font-semibold text-gray-900">
                            {item.listingTitle}
                          </p>
                          <p className="mx-0 mt-1 mb-0 text-sm text-gray-400">
                            {/* {item.quantity} */}what looks good here?
                          </p>
                        </div>

                        <div className="mt-4 flex items-end justify-between sm:mt-0 sm:items-start sm:justify-end">
                          <p className="w-20 shrink-0 text-base font-semibold text-gray-900 sm:order-2 sm:ml-8 sm:text-right">
                            {formatPrice(item.listingPrice * item.quantity)}
                          </p>

                          <div className="sm:order-1">
                            <div className="mx-auto flex h-8 items-stretch text-gray-600">
                              <button
                                onClick={(e) => updateQuantity(e, item)}
                                className="flex items-center justify-center rounded-l-md bg-gray-200 px-4 transition hover:bg-black hover:text-white"
                              >
                                -
                              </button>
                              <div className="flex w-full items-center justify-center bg-gray-100 px-4 text-xs uppercase transition">
                                {item.quantity}
                              </div>
                              <button
                                onClick={(e) => updateQuantity(e, item)}
                                className="flex items-center justify-center rounded-r-md bg-gray-200 px-4 transition hover:bg-black hover:text-white"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto">
                        <button
                          onClick={() => removeItemFromCart(item.listingId)}
                          type="button"
                          className="flex rounded p-2 text-center text-gray-500 transition-all duration-200 ease-in-out hover:text-gray-900 focus:shadow"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                              className=""
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-b py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(
                    cart.reduce(
                      (acc: number, item: CartItem) =>
                        acc + item.listingPrice * item.quantity,
                      0
                    )
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Shipping</p>
                <p className="text-lg font-semibold text-gray-900">
                  Calculated on checkout
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                <span className="text-xs font-normal text-gray-400">AUD</span>{" "}
                {formatPrice(
                  cart?.reduce(
                    (acc: number, item: CartItem) =>
                      acc + item.listingPrice * item.quantity,
                    0
                  ) + shipping
                )}
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/checkout"
                type="button"
                className="group inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow"
              >
                Checkout
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-4 h-6 w-6 transition-all group-hover:ml-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <p>No items</p>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
