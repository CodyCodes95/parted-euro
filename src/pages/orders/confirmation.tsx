// import type { NextPage } from "next";
// import { useEffect, useState } from "react";
// import Spacer from "../../components/Spacer";
// import { useCart } from "../../context/cartContext";

// const Confirmation: NextPage = () => {
//   const { cart, setCart } = useCart();
//   const [tempCart, setTempCart] = useState<typeof cart>([]);

//   useEffect(() => {
//     if (cart.length) {
//       setTempCart(cart);
//       setCart([]);
//     }
//   }, [cart]);

//   return (
//     <div className="py-14 px-4 md:px-6 2xl:container 2xl:mx-auto 2xl:px-20">
//       <div className="item-start flex flex-col justify-start space-y-2 ">
//         <h1 className="text-3xl font-semibold leading-7 text-gray-800 lg:text-4xl  lg:leading-9">
//           Order Confirmed
//         </h1>
//         <p className="text-base font-medium leading-6 text-gray-600">
//           {new Date().toLocaleDateString()}
//         </p>
//       </div>
//       <Spacer amount="2" />
//       <div className="w-fill flex items-center justify-center">
//         <p>Please check your email for your invoice.</p>
//       </div>
//       <div className="jusitfy-center mt-10 flex w-full flex-col items-stretch  space-y-4 md:space-y-6 xl:flex-row xl:space-x-8 xl:space-y-0">
//         <div className="flex w-full flex-col items-start justify-start space-y-4 md:space-y-6 xl:space-y-8">
//           <div className="flex w-full flex-col items-start justify-start bg-gray-50 px-4 py-4 md:p-6 md:py-6 xl:p-8">
//             <p className="text-lg font-semibold leading-6 text-gray-800 md:text-xl xl:leading-5">
//               Your Order
//             </p>
//             <Spacer amount="3" />
//             {tempCart.map((item) => (
//               <div
//                 key={item.listingTitle}
//                 className="mt-6 flex w-full flex-col items-start justify-start  space-y-4 md:mt-0 md:flex-row  md:items-center md:space-x-6 xl:space-x-8 "
//               >
//                 <div className="w-full md:w-40">
//                   <img
//                     className="hidden w-full md:block"
//                     src={item.listingImage}
//                     alt={item.listingTitle}
//                   />
//                   <img
//                     className="w-full md:hidden"
//                     src={item.listingImage}
//                     alt={item.listingTitle}
//                   />
//                 </div>
//                 <div className="  flex w-full flex-col items-start justify-between space-y-4 md:flex-row md:space-y-0  ">
//                   <div className="flex w-full flex-col items-start justify-start space-y-8">
//                     <h3 className="text-xl font-semibold leading-6 text-gray-800 xl:text-2xl">
//                       {item.listingTitle}
//                     </h3>
//                   </div>
//                   <div className="flex w-full items-start justify-between space-x-8">
//                     <p className="text-base leading-6 text-gray-800 xl:text-lg">
//                       {item.quantity}
//                     </p>
//                     <p className="text-base font-semibold leading-6 text-gray-800 xl:text-lg">
//                       ${item.listingPrice * item.quantity}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//        </div>
//     </div>
//   );
// };

// export default Confirmation;

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hkF8DZw0qRg
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "../../context/cartContext";

export default function OrderConfirmation() {
  const { cart, setCart } = useCart();
  const [tempCart, setTempCart] = useState<typeof cart>([]);

  useEffect(() => {
    if (cart.length) {
      setTempCart(cart);
      setCart([]);
    }
  }, [cart]);

  return (
    <>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-center space-y-0">
          <CardTitle>Order confirmation</CardTitle>
          <Button className="ml-auto" variant="secondary">
            Print
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 text-sm">
            <div>Order number</div>
            <div className="font-medium">#1234</div>
          </div>
          <div className="grid gap-2 text-sm">
            <div>Order date</div>
            <div className="font-medium">{new Date().toDateString()}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {tempCart.map((item) => (
            <div key={item.listingTitle} className="flex items-center gap-4">
              <img
                alt="Thumbnail"
                className="aspect-square rounded-md object-cover"
                height="100"
                src={item.listingImage}
                width="100"
              />
              <div className="grid gap-1 text-sm">
                <div className="font-medium">{item.listingTitle}</div>
                <div>SKU: #1234</div>
              </div>
              <div className="ml-auto grid gap-1 text-right">
                <div className="font-medium">x{item.quantity}</div>
                <div>${item.listingPrice * item.quantity}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Shipping address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="font-medium">Sophia Anderson</div>
          <div>1234 Main St.</div>
          <div>Anytown, CA 12345</div>
          <div>United States</div>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 text-sm">
            <div>
              Your order has been confirmed. Thank you for shopping with us!
            </div>
            <div>Please check your email for your invoice</div>
            <div className="font-medium">Order number: #1234</div>
            {/* <div className="font-medium">
              Estimated delivery: February 18, 2023
            </div> */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
