import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useEffect } from "react";
import { useCart } from "../../context/cartContext";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import LoadingSpinner from "../../components/ui/Loader";
import logo from "../../../public/logo.png";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice, formatter } from "../../utils/formatPrice";

export default function OrderConfirmation() {
  const { cart, setCart, emptyCart } = useCart();
  const router = useRouter();
  const updateOrder = trpc.orderItems.updateOrderItems.useMutation();

  const {
    data: order,
    isLoading: orderLoading,
    refetch,
  } = trpc.order.getOrder.useQuery(
    {
      id: router.query.orderId as string,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (cart.length) {
      emptyCart();
    }
  }, []);

  useEffect(() => {
    if (!router.query.orderId) return;
    updateOrderAndFetch();
  }, [router.query.orderId]);

  const updateOrderAndFetch = async () => {
    await updateOrder.mutateAsync({ orderId: router.query.orderId as string });
    refetch();
  };

  if (updateOrder.isLoading || orderLoading || !order) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="bg-white p-8 md:px-40">
      <div className="flex items-center justify-between border-b py-2">
        <img className="w-40" src={logo.src} alt="" />

        <Link className="flex items-center gap-2" href="/listings">
          <ShoppingBag />
          Return to store
        </Link>
      </div>
      {/* <div className="w-full border" /> */}
      <div className="py-8">
        <h2 className="mb-6 text-center text-3xl font-semibold">
          Order Confirmation
        </h2>
        <p className="mb-4 text-lg">
          Your order has been confirmed. Thank you for shopping with Parted
          Euro!
        </p>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Order Number:</h3>
            <p>{order.xeroInvoiceId}</p>
          </div>
          <div>
            <h3 className="font-semibold">Order Date:</h3>
            <p>{new Date(order.createdAt).toDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">Shipping Method:</h3>
            <p>{order.shipping ? "Ship" : "Pickup"}</p>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Name & Address:</h3>
          <p>{order.name}</p>
          <p>{order.shippingAddress}</p>
          <p>{order.email}</p>
        </div>
        {!order.shipping && (
          <>
            <p className="mb-4">For pickup orders:</p>
            <p className="mb-8">
              Once your order is ready for collection - you will receive an
              email with how to organise collection.
            </p>
          </>
        )}
      </div>
      <div className="border-b border-t py-4">
        <h2 className="mb-4 text-2xl font-semibold">Products Purchased</h2>
        <div className="space-y-4">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  alt="Product Image"
                  className="h-10 w-10"
                  height="40"
                  src={item.listing.images[0]?.url}
                  style={{
                    aspectRatio: "40/40",
                    objectFit: "cover",
                  }}
                  width="40"
                />
                <p className="text-lg">
                  {/* {item.listing.title} + {item.listing.partNumbers.join(", ")} */}
                  {item.listing.title}
                </p>
              </div>
              <p>Qty: {item.quantity}</p>
              <div className="flex items-center space-x-4">
                <p>Price: ${item.listing.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="py-4">
        <div className="flex justify-between">
          <h3 className="font-semibold">Subtotal:</h3>
          <p>{formatter.format(order.subtotal / 100)}</p>
        </div>
        <div className="flex justify-between">
          <h3 className="font-semibold">Shipping:</h3>
          <p>{formatter.format((order.shipping ?? 0) / 100)}</p>
        </div>
        <div className="flex justify-between">
          <h3 className="font-semibold">Total inc. GST:</h3>
          <p>
            {formatter.format(
              order.subtotal / 100 + (order.shipping ?? 0 / 100),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

//   <>
//     <Card className="mx-auto max-w-3xl">
//       <CardHeader className="flex flex-row items-center space-y-0">
//         <CardTitle>Order confirmation</CardTitle>
//         <Button
//           onClick={() => window.print()}
//           className="ml-auto"
//           variant="secondary"
//         >
//           Print
//         </Button>
//       </CardHeader>
//       <CardContent className="grid gap-4">
//         <div className="grid gap-2 text-sm">
//           <div>Name</div>
//           <div className="font-medium">{order.data?.name}</div>
//         </div>
//         <div className="grid gap-2 text-sm">
//           <div>Order number</div>
//           <div className="font-medium">{order.data?.xeroInvoiceId}</div>
//         </div>
//         <div className="grid gap-2 text-sm">
//           <div>Order date</div>
//           <div className="font-medium">
//             {order.data?.createdAt.toLocaleString()}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//     <Card className="mx-auto max-w-3xl">
//       <CardHeader>
//         <CardTitle>Items</CardTitle>
//       </CardHeader>
//       <CardContent className="grid gap-4">
//         {order.data?.orderItems.map((item) => (
//           <div key={item.listing.title} className="flex items-center gap-4">
//             <img
//               alt="Thumbnail"
//               className="aspect-square rounded-md object-cover"
//               height="100"
//               src={item.listing.images[0]?.url}
//               width="100"
//             />
//             <div className="grid gap-1 text-sm">
//               <div className="font-medium">{item.listing.title}</div>
//             </div>
//             <div className="ml-auto grid gap-1 text-right">
//               <div className="font-medium">x{item.quantity}</div>
//               <div>${item.listing.price * item.quantity}</div>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//     {/* <Card className="mx-auto max-w-3xl"> */}
//     {/* <CardHeader>
//         <CardTitle>Shipping address</CardTitle>
//       </CardHeader>
//       <CardContent className="grid gap-2 text-sm">
//         <div className="font-medium">{data.name}</div>
//       </CardContent>
//     </Card> */}
//     <Card className="mx-auto max-w-3xl">
//       <CardHeader>
//         <CardTitle>Confirmation</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid gap-1 text-sm">
//           <div>
//             Your order has been confirmed. Thank you for shopping with us!
//           </div>
//           <div>Please check your email for your invoice</div>
//           <div className="font-medium">
//             Order reference: #{order.data?.xeroInvoiceId}
//           </div>
//           {/* <div className="font-medium">
//             Estimated delivery: February 18, 2023
//           </div> */}
//         </div>
//       </CardContent>
//     </Card>
//   </>
// );
