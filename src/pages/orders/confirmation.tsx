import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useEffect } from "react";
import { useCart } from "../../context/cartContext";

export default function OrderConfirmation() {
  const { cart, setCart } = useCart();

  useEffect(() => {
    if (cart.length) {
      setCart([]);
    }
  }, []);

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
