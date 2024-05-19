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

  if (!order.xeroInvoiceId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertTriangleIcon className="h-12 w-12 text-red-500" />
          <h1 className="text-3xl font-bold">Invoice failed to generate</h1>
          <p className="max-w-[600px] text-gray-500 dark:text-gray-400">
            We were unable to generate an automatic invoice for your order.
            There is no need to worry, your payment has been recieved
            successfully and we will manually send you an invoice via email
            soon.
          </p>
        </div>
        <Card className="w-full max-w-sm p-0">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="grid gap-2 text-sm">
              <div className="font-medium">{order.id}</div>
              <div className="text-gray-500 dark:text-gray-400">
                Order reference
              </div>
            </div>
          </CardContent>
        </Card>
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
      <div className="flex flex-col items-end">
        <div className="grid w-3/4 grid-cols-2 text-end ">
          <h3 className="font-semibold">Subtotal:</h3>
          <p>{formatter.format(order.subtotal / 100)}</p>
        </div>
        <div className="grid w-3/4 grid-cols-2 text-end">
          <h3 className="font-semibold">Shipping:</h3>
          <p>{formatter.format((order.shipping ?? 0))}</p>
        </div>
        <div className="grid w-3/4 grid-cols-2 text-end">
          <h3 className="font-semibold">Total inc. GST:</h3>
          <p>
            {formatter.format(
              order.subtotal / 100 + (order.shipping ?? 0),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
