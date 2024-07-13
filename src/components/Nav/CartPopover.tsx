import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ShoppingBagIcon, ShoppingCartIcon, X } from "lucide-react";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "../../components/ui/popover";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCartStore } from "../../context/cartStore";

const CartPopover = () => {
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  const { cart, setCart } = useCartStore();

  const router = useRouter();

  const removeItemFromCart = (id: string) => {
    const updatedCart = cart.filter((i) => i.listingId !== id);
    setCart(updatedCart);
  };

  useEffect(() => {
    setCartOpen(false);
  }, [router]);

  return (
    <Popover open={cartOpen} onOpenChange={(open) => setCartOpen(open)} key="1">
      <PopoverTrigger asChild>
        <Button className="h-10 w-10 rounded-full p-1" variant="ghost">
          <span className="sr-only">Open cart</span>
          <ShoppingCartIcon className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 translate-y-2">
        <div className="flex flex-col gap-4 overflow-auto rounded-md">
          <h4 className="text-xl">Cart</h4>
          <div className="w-full border" />
          {cart.map((item) => (
            <Link
              href={`/listings/listing?id=${item.listingId}`}
              key={item.listingId}
              className="flex items-center gap-4 p-4 hover:bg-zinc-100"
            >
              <div className="relative">
                <button
                  className="group absolute -left-4 -top-4 rounded-full bg-white p-1 hover:bg-zinc-100"
                  onClick={(e) => {
                    e.preventDefault();
                    removeItemFromCart(item.listingId);
                  }}
                >
                  <X className="h-4 w-4 group-hover:text-red-500" />
                </button>
                <img
                  alt={item.listingTitle}
                  className="rounded"
                  height={64}
                  src={item.listingImage}
                  style={{
                    aspectRatio: "64/64",
                    objectFit: "cover",
                  }}
                  width={64}
                />
              </div>
              <div className="grid flex-1 gap-1 text-sm">
                <h6 className="font-medium leading-none">
                  {item.listingTitle}
                </h6>
                {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.listingVariant}
                </p> */}
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium">
                  {item.listingPrice.toLocaleString("en-AU", {
                    style: "currency",
                    currency: "AUD",
                  })}
                </div>
                <p className="text-sm ">Qty: {item.quantity}</p>
              </div>
            </Link>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <ShoppingBagIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
              <div className="flex flex-col items-center space-y-2 text-center">
                <h4 className="font-semibold">Your cart is empty</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You haven{"'"}t added any items to your cart yet.
                </p>
              </div>
              <Link className="w-full" href="/listings">
                <Button className="w-full" variant="outline">
                  Shop Now
                </Button>
              </Link>
            </div>
          )}
        </div>
        {cart.length > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-4">
            <Link className="w-full" href="/checkout">
              <Button className="w-full" size="sm" variant="outline">
                Checkout
              </Button>
            </Link>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>

    // <>
    //   <div className="flow-root">
    //     <ul className="-my-8">
    //       {cart.map((item, index) => (
    //         <li
    //           key={item.listingId}
    //           className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
    //         >
    //           <div className="shrink-0">
    //             <img
    //               className="h-24 w-24 max-w-full rounded-lg object-cover"
    //               src={item.listingImage}
    //               alt=""
    //             />
    //           </div>

    //           <div className="relative flex flex-1 flex-col justify-between">
    //             <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
    //               <div className="pr-8 sm:pr-5">
    //                 <p className="text-lg font-semibold text-gray-900">
    //                   {item.listingTitle}
    //                 </p>
    //               </div>
    //               <div className="mt-4 flex items-end justify-between sm:mt-0 sm:items-start sm:justify-end">
    //                 <p className="w-20 shrink-0 text-base font-semibold text-gray-900 sm:order-2 sm:ml-8 sm:text-right">
    //                   {formatPrice(item.listingPrice * item.quantity)}
    //                 </p>
    //                 <div className="sm:order-1">
    //                   <div className="mx-auto flex h-8 items-stretch text-gray-600">
    //         <Button onClick={() => decrementQty(index)}>-</Button>
    //                     <div className="flex w-full items-center justify-center bg-gray-100 px-4 text-xs uppercase transition">
    //                       {item.quantity}
    //                     </div>
    //                     <Button onClick={() => increaseQty(index)}>+</Button>

    //                   </div>
    //                 </div>
    //               </div>
    //             </div>

    //             <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto">
    //               <button
    //                 onClick={() => removeItemFromCart(item.listingId)}
    //                 type="button"
    //                 className="flex rounded p-2 text-center text-gray-500 transition-all duration-200 ease-in-out hover:text-gray-900 focus:shadow"
    //               >
    //                 <svg
    //                   className="h-5 w-5"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   stroke="currentColor"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth="2"
    //                     d="M6 18L18 6M6 6l12 12"
    //                     className=""
    //                   ></path>
    //                 </svg>
    //               </button>
    //             </div>
    //           </div>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   <div className="mt-6 flex items-center justify-between border-t-2 pt-2">
    //     <p className="text-sm font-medium text-gray-900">Subtotal</p>
    //     <p className="text-2xl font-semibold text-gray-900">
    //       <span className="text-xs font-normal text-gray-400">AUD</span>{" "}
    //       {formatPrice(
    //         cart?.reduce(
    //           (acc: number, item) =>
    //             acc + item.listingPrice * item.quantity,
    //           0
    //         ) + shipping
    //       )}
    //     </p>
    //   </div>

    //   <div className="mt-6 text-center">
    //     <Link
    //       href="/checkout"
    //       type="button"
    //       className="group inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow"
    //     >
    //       Checkout

    //     </Link>
    //   </div>
    // </>
  );
};

export default CartPopover;
