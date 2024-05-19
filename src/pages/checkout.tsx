import Link from "next/link";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {  Trash } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatter } from "../utils/formatPrice";
import { useQuery } from "@tanstack/react-query";

const libraries = ["places"];

type ShippingAddress = {
  postCode: string;
};

export default function CheckoutPage() {
  const { cart, setCart } = useCart();
  // const [parent] = useAutoAnimate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>();
  const [validated, setValidated] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { data: auspostShipping } = useQuery({
    queryKey: ["auspostShipping", shippingAddress?.postCode],
    queryFn: async () => {
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
      if (!res.ok) throw new Error(data.error);
      let express = Number(data.express);
      let regular = Number(data.regular);
      const cartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      for (let i = 0; i < cartItems - 1; i++) {
        express += express * 0.1;
        regular += regular * 0.1;
      }
      return {
        express: express.toFixed(2),
        regular: regular.toFixed(2),
      };
    },
    enabled: shippingAddress?.postCode.length === 4,
  });

  const submitCheckout = async () => {
    if (!validated) return toast.error("Please fill out all fields");
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: cart,
        regularShipping: auspostShipping!.regular,
        expressShipping: auspostShipping!.express,
        email,
        name,
      }),
    });
    const response = await res.json();
    window.location = response.url;
  };

  useEffect(() => {
    if (auspostShipping && name && email && acceptTerms) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  }, [auspostShipping, name, email, acceptTerms]);

  // useEffect(() => {
  //   if (
  //     cart.reduce((acc, item) => acc + item.weight * item.quantity, 0) >= 22
  //   ) {
  //     setShippingMethod({
  //       label: "Pickup",
  //       value: 0,
  //     });
  //     setExpressCost(0);
  //     setRegularCost(0);
  //   }
  // }, [cart]);

  return (
    <div className="bg-white p-8 md:px-40">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 md:px-6">
        <section className="flex flex-col gap-4 border-b py-6 md:gap-8">
          <div className="grid gap-2 text-sm">
            <h1 className="text-xl font-semibold md:text-2xl">Your Cart</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your cart contains {cart.length} items
            </p>
          </div>
          <div className="space-y-4">
            {cart.map((item) => (
              <Link
                href={`/listings/listing?id=${item.listingId}`}
                key={item.listingId}
                className="flex items-center justify-between "
              >
                <div className="flex items-center space-x-4">
                  <img
                    alt="Product Image"
                    className="h-10 w-10"
                    height="40"
                    src={item.listingImage}
                    style={{
                      aspectRatio: "40/40",
                      objectFit: "cover",
                    }}
                    width="40"
                  />
                  <p className="text-lg">
                    {/* {item.listing.title} + {item.listing.partNumbers.join(", ")} */}
                    {item.listingTitle}
                  </p>
                </div>
                <div className="flex flex-col flex-col gap-2 md:flex-row">
                  <div className="flex items-center gap-2">
                    <p>Qty:</p>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        e.preventDefault();
                        setCart((prev: any) => {
                          if (prev === undefined) return;
                          const index = prev.findIndex(
                            (item: any) => item.listingId === item.listingId,
                          );
                          if (index === -1) return prev;
                          return prev.map((item: any) => {
                            if (item.listingId === item.listingId) {
                              return {
                                ...item,
                                quantity: Number(e.target.value),
                              };
                            }
                            return item;
                          });
                        });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <p className="flex items-center gap-2">
                      Price:
                      <span className="font-bold">
                        {formatter.format(item.listingPrice)}
                      </span>
                    </p>
                    <Trash
                      onClick={(e) => {
                        e.preventDefault();
                        setCart((prev: any) => {
                          if (prev === undefined) return;
                          const index = prev.findIndex(
                            (item: any) => item.listingId === item.listingId,
                          );
                          if (index === -1) return prev;
                          return prev.filter((item: any) => {
                            return item.listingId !== item.listingId;
                          });
                        });
                      }}
                      className="h-4 w-4 cursor-pointer text-red-500"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="py-4">
            <div className="grid w-3/4 grid-cols-2 md:w-1/2">
              <h3 className="font-semibold">Shipping:</h3>
              <p>Calculated at checkout</p>
            </div>
            <div className="grid w-3/4 grid-cols-2 md:w-1/2">
              <h3 className="font-semibold">Total inc. GST:</h3>
              <p>
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
              </p>
            </div>
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
              <div className="grid gap-1.5">
                <Label className="text-sm" htmlFor="zip">
                  Terms and conditions
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    className="w-4 h-4"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span>
                    I have read & agree to the{" "}
                    <Link target="_blank" className="hover:underline text-blue-500" href="/returns-refunds">Terms and Conditions</Link>
                  </span>
                </div>
              </div>
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
            <div className="grid gap-4"></div>
            <Button type="submit" disabled={validated ? false : true}>
              Pay & Review
            </Button>
          </section>
        </form>
      </main>
    </div>
  );
}
