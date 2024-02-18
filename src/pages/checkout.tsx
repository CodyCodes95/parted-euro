import Link from "next/link";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Package2Icon, ShoppingBag } from "lucide-react";
import { useCart } from "../context/cartContext";

export default function CheckoutPage() {
  const { cart, setCart } = useCart();
  return (
    <div className="flex min-h-screen flex-col py-4 md:py-8">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 md:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <Package2Icon className="h-6 w-6" />
          <span className="">Parted Euro</span>
        </Link>
        <Link
          className="ml-auto flex items-center gap-2 text-sm underline underline-offset-2"
          href="#"
        >
          <ShoppingBag className="h-4 w-4" />
          Return to store
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 md:px-6">
        <section className="flex flex-col gap-4 border-b border-t py-6 md:gap-8">
          <div className="grid gap-2 text-sm">
            <h1 className="text-xl font-semibold md:text-2xl">
              Review your order
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your cart contains {cart.length} items
            </p>
          </div>
          <div className="grid gap-4">
     
            {/* <div className="grid grid-cols-[60px_1fr] items-start gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  alt="Thumbnail"
                  className="aspect-object cover-[object-position] rounded-lg"
                  height="120"
                  src="/placeholder.svg"
                  width="120"
                />
              </div>
              <div className="grid gap-1.5">
                <h2 className="text-base font-semibold md:text-lg">
                  Glimmer Lamps
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <div>Quantity: 2</div>
                  <div>Price: $60.00</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_1fr] items-start gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  alt="Thumbnail"
                  className="aspect-object cover-[object-position] rounded-lg"
                  height="120"
                  src="/placeholder.svg"
                  width="120"
                />
              </div>
              <div className="grid gap-1.5">
                <h2 className="text-base font-semibold md:text-lg">
                  Aqua Filters
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <div>Quantity: 3</div>
                  <div>Price: $16.33</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_1fr] items-start gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  alt="Thumbnail"
                  className="aspect-object cover-[object-position] rounded-lg"
                  height="120"
                  src="/placeholder.svg"
                  width="120"
                />
              </div>
              <div className="grid gap-1.5">
                <h2 className="text-base font-semibold md:text-lg">
                  Aqua Filters
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <div>Quantity: 3</div>
                  <div>Price: $16.33</div>
                </div>
              </div>
            </div> */}
                   {cart?.map(item => {
              return (
                  
              )
            })}
          </div>
        </section>
        <section className="grid gap-4 py-6">
          <h2 className="text-lg font-semibold md:text-xl">
            Shipping information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-sm" htmlFor="name">
                Full name
              </Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm" htmlFor="address">
                Address
              </Label>
              <Input id="address" placeholder="Enter your address" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm" htmlFor="city">
                City
              </Label>
              <Input id="city" placeholder="Enter your city" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm" htmlFor="state">
                State
              </Label>
              <Select>
                <option>New York</option>
                <option>California</option>
                <option>Texas</option>
                <option>Florida</option>
                <option>Illinois</option>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm" htmlFor="zip">
                ZIP code
              </Label>
              <Input id="zip" placeholder="Enter your ZIP code" />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4 py-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 items-start gap-4">
              <div>Subtotal</div>
              <div>$92.33</div>
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <div>Shipping</div>
              <div>$10.00</div>
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <div>Tax</div>
              <div>$8.79</div>
            </div>
          </div>
          <div className="grid grid-cols-2 items-start gap-4 text-lg font-semibold">
            <div>Total</div>
            <div>$111.12</div>
          </div>
          <Button className="mt-4">Place order</Button>
        </section>
      </main>
    </div>
  );
}

// import type { NextPage } from "next";
// import Head from "next/head";
// import Link from "next/link";
// import {  useEffect, useState } from "react";
// import { formatPrice } from "../utils/formatPrice";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
// import { useLoadScript } from "@react-google-maps/api";
// import Spacer from "../components/Spacer";
// import { toast } from "sonner";
// import Select from "react-select";
// import type { CartItem} from "../context/cartContext";
// import { useCart } from "../context/cartContext";
// import ShippingAddressField from "../components/checkout/ShippingAddressField";

// type ShippingAddress = {
//   postCode: string;
// };

// const libraries = ["places"];

// const Checkout: NextPage = () => {
//   const { cart, setCart } = useCart();

//   const [shippingAddress, setShippingAddress] = useState<ShippingAddress>();
//   const [shippingMethod, setShippingMethod] = useState<any>({
//     label: "Pickup",
//     value: 0,
//   });
//   const [expressCost, setExpressCost] = useState(0);
//   const [regularCost, setRegularCost] = useState(0);
//   const [validated, setValidated] = useState(false);

//   const [parent] = useAutoAnimate();

//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
//     libraries: libraries as any,
//   });

//   const removeItemFromCart = (id: string) => {
//     const updatedCart = cart.filter((i) => i.listingId !== id);
//     setCart(updatedCart);
//   };

//   const increaseQty = (index: number) => {
//     const item = cart[index]
//     if (!item) return
//     item.quantity += 1
//     cart[index] = item
//     setCart([...cart])
//   }

//   const decrementQty = (index: number) => {
//     const item = cart[index]
//     if (!item) return
//     item.quantity -= 1
//     if (item.quantity < 1) {
//       removeItemFromCart(item.listingId)
//       return
//     }
//     cart[index] = item
//     setCart([...cart])
//   }

//   const calculateAuspostShipping = async () => {
//     const largestItem = cart.reduce((prev, current) =>
//       prev.length * prev.width * prev.height >
//       current.length * current.width * current.height
//         ? prev
//         : current
//     );
//     const res = await fetch(`/api/checkout/shipping`, {
//       method: "POST",
//       body: JSON.stringify({
//         length: largestItem.length,
//         width: largestItem.width,
//         height: largestItem.height,
//         weight: cart.reduce(
//           (acc, item) => acc + item.weight * item.quantity,
//           0
//         ),
//         from: "3152",
//         to: shippingAddress?.postCode,
//       }) as any,
//     });
//     const data = await res.json();
//     if (!res.ok) return toast.error(data.error);
//     let express = Number(data.express);
//     let regular = Number(data.regular);
//     const cartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
//     for (let i = 0; i < cartItems - 1; i++) {
//       express += express * 0.1;
//       regular += regular * 0.1;
//     }
//     setExpressCost(Number(express.toFixed(2)));
//     setRegularCost(Number(regular.toFixed(2)));
//   };

//   useEffect(() => {
//     if (shippingAddress?.postCode.length === 4) {
//       calculateAuspostShipping();
//     }
//   }, [shippingAddress?.postCode, cart]);

//   const submitCheckout = async () => {
//     const res = await fetch("/api/checkout", {
//       method: "POST",
//       body: JSON.stringify({
//         items: cart,
//         regularShipping: regularCost,
//         expressShipping: expressCost,
//         // email: email,
//         // address: shippingAddress,
//         // name: `${firstName} ${lastName}`,
//       }),
//     });
//     const response = await res.json();
//     window.location = response.url;
//   };

//   useEffect(() => {
//     if (regularCost || shippingMethod.value === 0) {
//       setValidated(true);
//     } else {
//       setValidated(false);
//     }
//   }, [regularCost, expressCost, shippingMethod.value]);

//   useEffect(() => {
//     if (
//       cart.reduce((acc, item) => acc + item.weight * item.quantity, 0) >= 22
//     ) {
//       setShippingMethod({
//         label: "Pickup",
//         value: 0,
//       });
//       setExpressCost(0);
//       setRegularCost(0);
//     }
//   }, [cart]);

//   if (!cart.length) {
//     return (
//           <div className="flex flex-col items-center justify-center h-screen">
//       <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
//       <p className="text-gray-500 mb-8">You have no items in your shopping cart</p>
//       <Link href="/listings" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Go to Shop</Link>
//     </div>
//     )
//   }

//   return (
//     <>
//       <Head>
//         <title>Checkout</title>
//         <meta name="description" content="Generated by create-t3-app" />
//       </Head>
//       <main className="max-w-screen flex min-h-screen w-full justify-center p-12">
//         <div className="flex w-[75%] flex-col justify-between p-14">
//           {cart.length > 0 ? (
//             <>
//               <ul ref={parent as any} className="my-8">
//                 {cart.map((item: CartItem, index) => (
//                   <li
//                     key={item.listingId}
//                     className="flex flex-col space-y-3 border-b-2 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
//                   >
//                     <div className="shrink-0">
//                       <img
//                         className="h-40 w-40 max-w-full rounded-lg object-cover"
//                         src={item.listingImage}
//                         alt=""
//                       />
//                     </div>

//                     <div className="relative flex flex-1 flex-col justify-between">
//                       <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
//                         <div className="pr-8 sm:pr-5">
//                           <p className="text-xl font-semibold text-gray-900">
//                             {item.listingTitle}
//                           </p>
//                           {/* <p className="mx-0 mt-1 mb-0 text-sm text-gray-400">
//                             {item.quantity}
//                           </p> */}
//                         </div>

//                         <div className="mt-4 flex justify-between sm:mt-0">
//                           <p className="w-20 shrink-0 text-base font-semibold text-gray-900 sm:ml-8 sm:text-right">
//                             {formatPrice(item.listingPrice * item.quantity)}
//                           </p>

//                           <div className="">
//                             <div className="mx-auto flex h-8 items-stretch text-gray-600">
//                               <button
//                                 onClick={(e) => decrementQty(index)}
//                                 className="flex items-center justify-center rounded-l-md bg-gray-200 px-4 transition hover:bg-black hover:text-white"
//                               >
//                                 -
//                               </button>
//                               <div className="flex w-full items-center justify-center bg-gray-100 px-4 text-xs uppercase transition">
//                                 {item.quantity}
//                               </div>
//                               <button
//                                 onClick={(e) => increaseQty(index)}
//                                 className="flex items-center justify-center rounded-r-md bg-gray-200 px-4 transition hover:bg-black hover:text-white"
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => removeItemFromCart(item.listingId)}
//                             type="button"
//                             className="flex rounded p-2 text-center text-gray-500 transition-all duration-200 ease-in-out hover:text-gray-900 focus:shadow"
//                           >
//                             <svg
//                               className="h-5 w-5"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M6 18L18 6M6 6l12 12"
//                                 className=""
//                               ></path>
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </>
//           ) : (
//             <p>No items</p>
//           )}
//         </div>
//         <div className="flex w-[33%] flex-col py-14">
//           <div className="py-2">
//             <div className="flex items-center justify-between border-b-2 px-6 py-12">
//               <p className="text-xl font-semibold text-gray-900">
//                 Shipping Calculated on Checkout
//               </p>
//             </div>
//             <div className="flex flex-col justify-between border-b-2 px-6 py-12">
//               <div>
//                 <p className="mr-4 text-xl text-gray-400">Shipping Method</p>
//                 <Select
//                   value={shippingMethod}
//                   onChange={(e: any) => setShippingMethod(e)}
//                   options={
//                     cart.reduce(
//                       (acc, item) => acc + item.weight * item.quantity,
//                       0
//                     ) < 22
//                       ? [
//                           { label: "Shipped", value: 1 },
//                           { label: "Pickup", value: 0 },
//                         ]
//                       : [{ label: "Pickup", value: 0 }]
//                   }
//                 />
//               </div>
//               <Spacer amount="3" />
//               {cart.reduce(
//                 (acc, item) => acc + item.weight * item.quantity,
//                 0
//               ) >= 22 ? (
//                 <p className="text-lg text-red-500">
//                   Only pickup is available as your order exceeds 22KG
//                 </p>
//               ) : null}
//             </div>
//             {shippingMethod.value ? (
//               <div className="flex flex-col  justify-between border-b-2 px-6 py-12">
//                 <p className="mr-4 text-xl text-gray-400">Shipping Postcode</p>
//                 <input
//                   className="border-2 p-2"
//                   type="text"
//                   value={shippingAddress?.postCode}
//                   onChange={(e) => {
//                     setShippingAddress({
//                       ...shippingAddress,
//                       postCode: e.target.value,
//                     });
//                   }}
//                 />
//               </div>
//             ) : null}
//             {isLoaded && shippingMethod.value ? (
//               <ShippingAddressField setShippingAddress={setShippingAddress} />
//             ) : null}
//           </div>
//           <div className="mt-6 flex items-center justify-between px-6 py-12">
//             <p className="text-xl font-bold text-gray-900">Subtotal</p>
//             <p className="text-2xl font-semibold text-gray-900">
//               <span className="text-xs font-normal text-gray-400">AUD</span>{" "}
//               {formatPrice(
//                 cart?.reduce(
//                   (acc: number, item: CartItem) =>
//                     acc + item.listingPrice * item.quantity,
//                   0
//                 ) // + Number(shipping)
//               )}
//             </p>
//           </div>
//           <div className="mt-6 text-center">
//             <button
//               onClick={submitCheckout}
//               type="button"
//               disabled={validated ? false : true}
//               className={`group inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow`}
//             >
//               Checkout
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="ml-4 h-6 w-6 transition-all group-hover:ml-8"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M13 7l5 5m0 0l-5 5m5-5H6"
//                 />
//               </svg>
//             </button>
//             <Link
//               href="/listings"
//               type="button"
//               className="group mt-5 inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow"
//             >
//               Continue Shopping
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="ml-4 h-6 w-6 transition-all group-hover:ml-8"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M13 7l5 5m0 0l-5 5m5-5H6"
//                 />
//               </svg>
//             </Link>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// };

// export default Checkout;
