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

export default function OrderConfirmation() {
  const { cart, setCart } = useCart();
  const router = useRouter();

  const { data } = trpc.order.getOrder.useQuery(router.query.orderId as string);

  useEffect(() => {
    if (cart.length) {
      setCart([]);
    }
  }, []);

  if (!data) return null;

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
            <div className="font-medium">{data.createdAt.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {data.items
            .reduce(
              (acc, cur) => {
                const existing = acc.find((item) => item.id === cur.id);
                if (existing) {
                  existing.quantity += 1;
                } else {
                  acc.push({ ...cur, quantity: 1 });
                }
                return acc;
              },
              [] as {
                id: string;
                title: string;
                images: { url: string }[];
                price: number;
                quantity: number;
              }[],
            )
            .map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <img
                  alt="Thumbnail"
                  className="aspect-square rounded-md object-cover"
                  height="100"
                  src={item.images[0]?.url}
                  width="100"
                />
                <div className="grid gap-1 text-sm">
                  <div className="font-medium">{item.title}</div>
                </div>
                <div className="ml-auto grid gap-1 text-right">
                  <div className="font-medium">x{item.quantity}</div>
                  <div>${item.price * item.quantity}</div>
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
          <div className="font-medium">{data.name}</div>
          {/* <div>1234 Main St.</div>
          <div>Anytown, CA 12345</div>
          <div>United States</div> */}
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
            <div className="font-medium">
              Order reference: #{data.xeroInvoiceId}
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
