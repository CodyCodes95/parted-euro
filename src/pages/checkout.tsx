import Link from "next/link";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Package2Icon, ShoppingBag } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { toast } from "sonner";

const libraries = ["places"];

type ShippingAddress = {
  postCode: string;
};

export default function CheckoutPage() {
  const { cart } = useCart();
  // const [parent] = useAutoAnimate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>();
  const [shippingMethod, setShippingMethod] = useState<any>({
    label: "Pickup",
    value: 0,
  });
  const [expressCost, setExpressCost] = useState(0);
  const [regularCost, setRegularCost] = useState(0);
  const [validated, setValidated] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
  //   libraries: libraries as any,
  // });

  const calculateAuspostShipping = async () => {
    const largestItem = cart.reduce((prev, current) =>
      prev.length * prev.width * prev.height >
      current.length * current.width * current.height
        ? prev
        : current,
    );
    const res = await fetch(`/api/checkout/shipping`, {
      method: "POST",
      body: JSON.stringify({
        length: largestItem.length,
        width: largestItem.width,
        height: largestItem.height,
        weight: cart.reduce(
          (acc, item) => acc + item.weight * item.quantity,
          0,
        ),
        from: "3152",
        to: shippingAddress?.postCode,
      }) as any,
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    let express = Number(data.express);
    let regular = Number(data.regular);
    const cartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    for (let i = 0; i < cartItems - 1; i++) {
      express += express * 0.1;
      regular += regular * 0.1;
    }
    setExpressCost(Number(express.toFixed(2)));
    setRegularCost(Number(regular.toFixed(2)));
  };

  useEffect(() => {
    if (shippingAddress?.postCode.length === 4) {
      calculateAuspostShipping();
    }
  }, [shippingAddress?.postCode, cart]);

  const submitCheckout = async () => {
    if (!validated) return toast.error("Please fill out all fields");
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: cart,
        regularShipping: regularCost,
        expressShipping: expressCost,
        email,
        name,
      }),
    });
    const response = await res.json();
    window.location = response.url;
  };

  useEffect(() => {
    if ((regularCost && name && email) || shippingMethod.value === 0) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  }, [regularCost, expressCost, shippingMethod.value]);

  useEffect(() => {
    if (
      cart.reduce((acc, item) => acc + item.weight * item.quantity, 0) >= 22
    ) {
      setShippingMethod({
        label: "Pickup",
        value: 0,
      });
      setExpressCost(0);
      setRegularCost(0);
    }
  }, [cart]);

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
            {cart?.map((item) => {
              return (
                <Link
                  href={`/listings/listing?id=${item.listingId}`}
                  key={item.listingId}
                  className="grid grid-cols-[60px_1fr] items-start gap-4"
                >
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img
                      alt="Thumbnail"
                      className="aspect-object cover-[object-position] rounded-lg"
                      height="120"
                      src={item.listingImage}
                      width="120"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <h2 className="text-base font-semibold md:text-lg">
                      {item.listingTitle}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                      <div>Quantity: {item.quantity}</div>
                      <div>Price: ${item.listingPrice}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCheckout();
          }}
        >
          <section className="grid gap-4 py-6">
            <h2 className="text-lg font-semibold md:text-xl">
              Shipping information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-sm" htmlFor="name">
                  Full name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="name"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="address"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-sm" htmlFor="zip">
                  Shipping method
                </Label>
                <ReactSelect
                  value={shippingMethod}
                  onChange={(e: any) => setShippingMethod(e)}
                  options={
                    cart.reduce(
                      (acc, item) => acc + item.weight * item.quantity,
                      0,
                    ) < 22
                      ? [
                          { label: "Shipped", value: 1 },
                          { label: "Pickup", value: 0 },
                        ]
                      : [{ label: "Pickup", value: 0 }]
                  }
                />
              </div>
              {shippingMethod.value ? (
                <div className="grid gap-1.5">
                  <Label className="text-sm" htmlFor="zip">
                    Postcode
                  </Label>
                  <Input
                    value={shippingAddress?.postCode}
                    onChange={(e) => {
                      setShippingAddress({
                        ...shippingAddress,
                        postCode: e.target.value,
                      });
                    }}
                    id="postcode"
                    placeholder="Enter your postcode"
                  />
                </div>
              ) : null}
              {cart.reduce(
                (acc, item) => acc + item.weight * item.quantity,
                0,
              ) >= 22 ? (
                <p className="text-lg text-red-500">
                  Only pickup is available as your order exceeds 22KG
                </p>
              ) : null}
            </div>
            {/* {isLoaded && shippingMethod.value ? (
            <ShippingAddressField setShippingAddress={setShippingAddress} />
          ) : null} */}
          </section>
          <section className="flex flex-col gap-4 py-6">
            <div className="grid gap-4">
              {/* <div className="grid grid-cols-2 items-start gap-4">
              <div>Subtotal</div>
              <div>
                {cart
                  ?.reduce(
                    (acc: number, item) =>
                      acc + item.listingPrice * item.quantity,
                    0,
                  )
                  .toLocaleString("en-au", {
                    style: "currency",
                    currency: "AUD",
                  })}
              </div>
            </div> */}
              <div className="grid grid-cols-2 items-start gap-4">
                <div>Shipping</div>
                <div>Calculated at checkout</div>
              </div>
              {/* <div className="grid grid-cols-2 items-start gap-4">
              <div>Tax</div>
              <div>$8.79</div>
            </div> */}
            </div>
            <div className="grid grid-cols-2 items-start gap-4 text-lg font-semibold">
              <div>Total</div>
              <div>
                {cart
                  ?.reduce(
                    (acc: number, item) =>
                      acc + item.listingPrice * item.quantity,
                    0,
                  )
                  .toLocaleString("en-au", {
                    style: "currency",
                    currency: "AUD",
                  })}
              </div>
            </div>
            <Button type="submit" disabled={validated ? false : true}>
              Checkout
            </Button>
          </section>
        </form>
      </main>
    </div>
  );
}
