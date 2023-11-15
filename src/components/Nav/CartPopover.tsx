import { useState } from "react";
import { formatPrice } from "../../utils/formatPrice";
import Link from "next/link";
import  { useCart } from "../../context/cartContext";
import Spacer from "../Spacer";
import { Button } from "../ui/button";

const CartPopover = () => {
  const [shipping, setShipping] = useState<number>(0);

  const { cart, setCart } = useCart()

  const increaseQty = (index: number) => {
    const item = cart[index]
    if (!item) return
    item.quantity += 1
    cart[index] = item
    setCart([...cart])
  }

  const decrementQty = (index: number) => {
    const item = cart[index]
    if (!item) return
    item.quantity -= 1
    cart[index] = item
    setCart([...cart])
}

  const removeItemFromCart = (id: string) => {
    const updatedCart = cart.filter((i) => i.listingId !== id);
    setCart(updatedCart);
  };

  if (!cart.length) {
    return (
          <div className="flex w-full flex-col items-center justify-center">
      <p className="text-lg">No items in your cart</p>
      <Spacer amount="3" />
      <Link
        href="/listings"
        type="button"
        className="group inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow"
      >
        Start shopping
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-4 h-6 w-6 transition-all group-hover:ml-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
    )
  }

    return (
      <>
        <div className="flow-root">
          <ul className="-my-8">
            {cart.map((item, index) => (
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
                      <p className="text-lg font-semibold text-gray-900">
                        {item.listingTitle}
                      </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between sm:mt-0 sm:items-start sm:justify-end">
                      <p className="w-20 shrink-0 text-base font-semibold text-gray-900 sm:order-2 sm:ml-8 sm:text-right">
                        {formatPrice(item.listingPrice * item.quantity)}
                      </p>
                      <div className="sm:order-1">
                        <div className="mx-auto flex h-8 items-stretch text-gray-600">
              <Button onClick={() => decrementQty(index)}>-</Button>
                          <div className="flex w-full items-center justify-center bg-gray-100 px-4 text-xs uppercase transition">
                            {item.quantity}
                          </div>
                          <Button onClick={() => increaseQty(index)}>+</Button>
      
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
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

        <div className="mt-6 flex items-center justify-between border-t-2 pt-2">
          <p className="text-sm font-medium text-gray-900">Subtotal</p>
          <p className="text-2xl font-semibold text-gray-900">
            <span className="text-xs font-normal text-gray-400">AUD</span>{" "}
            {formatPrice(
              cart?.reduce(
                (acc: number, item) =>
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
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </>
    );
};

export default CartPopover;
