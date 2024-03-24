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

export default function OrderConfirmation() {
  const { cart, setCart } = useCart();
  const router = useRouter();
  const updateOrder = trpc.orderItems.updateOrderItems.useMutation();

  const order = trpc.order.getOrder.useQuery(
    {
      id: router.query.orderId as string,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (cart.length) {
      setCart([]);
    }
    updateOrderAndFetch();
  }, []);

  const updateOrderAndFetch = async () => {
    await updateOrder.mutateAsync({ orderId: router.query.orderId as string });
    order.refetch();
  };

  if (updateOrder.isLoading || order.isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-center space-y-0">
          <CardTitle>Order confirmation</CardTitle>
          <Button
            onClick={() => window.print()}
            className="ml-auto"
            variant="secondary"
          >
            Print
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 text-sm">
            <div>Name</div>
            <div className="font-medium">{order.data?.name}</div>
          </div>
          <div className="grid gap-2 text-sm">
            <div>Order number</div>
            <div className="font-medium">{order.data?.xeroInvoiceId}</div>
          </div>
          <div className="grid gap-2 text-sm">
            <div>Order date</div>
            <div className="font-medium">
              {order.data?.createdAt.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {order.data?.orderItems.map((item) => (
            <div key={item.listing.title} className="flex items-center gap-4">
              <img
                alt="Thumbnail"
                className="aspect-square rounded-md object-cover"
                height="100"
                src={item.listing.images[0]?.url}
                width="100"
              />
              <div className="grid gap-1 text-sm">
                <div className="font-medium">{item.listing.title}</div>
              </div>
              <div className="ml-auto grid gap-1 text-right">
                <div className="font-medium">x{item.quantity}</div>
                <div>${item.listing.price * item.quantity}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* <Card className="mx-auto max-w-3xl"> */}
      {/* <CardHeader>
          <CardTitle>Shipping address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="font-medium">{data.name}</div>
        </CardContent>
      </Card> */}
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
            <div className="font-medium">
              Order reference: #{order.data?.xeroInvoiceId}
            </div>
            {/* <div className="font-medium">
              Estimated delivery: February 18, 2023
            </div> */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
