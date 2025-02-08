import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ShoppingBagIcon, ShoppingCartIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCartStore } from "../../context/cartStore";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "../ui/SheetDrawer";

const CartPopover = () => {
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const { cart, setCart } = useCartStore();
  const router = useRouter();

  const removeItemFromCart = (id: string) => {
    const updatedCart = cart.filter((i) => i.listingId !== id);
    setCart(updatedCart);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCartOpen(false);
  }, [router]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.listingPrice * item.quantity,
    0,
  );

  if (!mounted) {
    return (
      <Button className="relative h-10 w-10 rounded-full p-1" variant="ghost">
        <span className="sr-only">Open cart</span>
        <ShoppingCartIcon className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Drawer direction="right" open={cartOpen} onOpenChange={setCartOpen}>
      <DrawerTrigger asChild>
        <Button className="relative h-10 w-10 rounded-full p-1" variant="ghost">
          <span className="sr-only">Open cart</span>
          <ShoppingCartIcon className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {cart.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[96vh]">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle>Shopping Cart</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 px-4 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Your cart is empty</h3>
                <p className="text-sm text-gray-500">
                  Looks like you haven{"'"}t added any items to your cart yet.
                </p>
              </div>
              <Link href="/listings">
                <Button className="w-full" variant="outline">
                  Browse Store
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.listingId} className="flex gap-6 px-4 py-6">
                  <div className="relative">
                    <button
                      className="group absolute -right-2 -top-2 z-10 rounded-full bg-white p-1.5 shadow-md transition-colors hover:bg-gray-100"
                      onMouseDown={() => removeItemFromCart(item.listingId)}
                    >
                      <X className="h-4 w-4 group-hover:text-red-500" />
                    </button>
                    <Link href={`/listings/${item.listingId}`}>
                      <img
                        alt={item.listingTitle}
                        className="h-24 w-24 rounded-lg border border-gray-100 object-cover"
                        src={item.listingImage}
                      />
                    </Link>
                  </div>
                  <div className="flex flex-1 flex-col space-y-2">
                    <Link
                      href={`/listings/${item.listingId}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {item.listingTitle}
                    </Link>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                      <p className="text-lg font-semibold">
                        {item.listingPrice.toLocaleString("en-AU", {
                          style: "currency",
                          currency: "AUD",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <DrawerFooter className="border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">
                {cartTotal.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </span>
            </div>
            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CartPopover;
