import { useEffect, useState } from "react";
import type { OrderItem } from "../../pages/admin/listings";
import { trpc } from "../../utils/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

type FinialiseOrderProps = {
  order: OrderItem[];
};

const FinialiseOrder = ({ order }: FinialiseOrderProps) => {
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "post">(
    "pickup",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [postageCost, setPostageCost] = useState<number>(0);
  const [xeroInvoice, setXeroInvoice] = useState<boolean>(false);
  const [orderItems, setOrderItems] = useState<OrderItem[] | undefined>([]);

  const inventoryItems = trpc.parts.getInventoryDetailsById.useQuery(
    order.map((item) => item.inventoryId),
    // {
    //   onSuccess: (data) => {
    //     setOrderItems(data);
    //   },
    // }
  );

  // const removeItem = (inventoryId: string) => {
  //   setOrderItems((prev) => {
  //     if (prev === undefined) return;
  //     const index = prev.findIndex((item) => item.inventoryId === inventoryId);
  //     if (index === -1) return;
  //     const newOrder = [...prev];
  //     newOrder.splice(index, 1);
  //     return newOrder;
  //   });
  // };

  const orderMutate = trpc.order.createOrder.useMutation();

  const decreaseQuantityMutate = trpc.parts.decreaseQuantity.useMutation();

  const createOrder = async () => {
    if (!orderItems) return;
    const res = await orderMutate.mutateAsync({
      items: order.map((item) => item.inventoryId),
      name,
      email,
      shippingAddress,
      shippingMethod,
      shipping: postageCost,
      xero: xeroInvoice,
      subtotal: orderItems.reduce((acc, item) => {
        const orderItem = order.find(
          (orderItem) => orderItem.inventoryId === item.inventoryId,
        );
        if (!orderItem) return acc;
        return acc + orderItem.price * orderItem.quantity;
      }, 0),
    });
    await Promise.all(
      orderItems.map(async (item) => {
        const orderItem = order.find(
          (orderItem) => orderItem.inventoryId === item.inventoryId,
        );
        if (!orderItem) return;
        await decreaseQuantityMutate.mutateAsync({
          id: item.inventoryId,
          quantity: orderItem.quantity,
        });
      }),
    );
    console.log(res);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4 border p-4">
        <h4 className="flex justify-center">Item</h4>
        <h4 className="flex justify-center">Quantity</h4>
        <h4 className="flex justify-center">Price</h4>
        {inventoryItems.data?.map((item) => (
          <>
            <p className="flex justify-center">
              {item.partDetails.name} - {item.donorVin}
            </p>
            <p className="flex justify-center">{item.quantity}</p>
            <p className="relative flex justify-center">
              ${0}
              {/* <X
                // onClick={() => removeItem(item.id)}
                className="absolute right-0 bottom-20 cursor-pointer"
              /> */}
            </p>
          </>
        ))}
      </div>
      <div className="z-50 grid grid-cols-2 gap-4 p-4">
        <p>Shipping Method:</p>
        <Select
          onValueChange={(value: "pickup" | "post") => {
            setShippingMethod(value);
            if (value === "pickup") setPostageCost(0);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Shipping Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="post">Post</SelectItem>
          </SelectContent>
        </Select>
        {shippingMethod === "post" && (
          <>
            <p>Postage Cost:</p>
            <Input
              value={postageCost}
              onChange={(e) => setPostageCost(Number(e.target.value))}
            />
            <p>Shipping Address</p>
            <Input
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </>
        )}
        <p>Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <p>Email</p>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <p>Create Xero Invoice (Coming soon!)</p>
        <input type="checkbox" disabled />
      </div>
      <div className="flex w-full justify-end">
        <Button onClick={createOrder}>Create</Button>
      </div>
    </div>
  );
};

export default FinialiseOrder;
