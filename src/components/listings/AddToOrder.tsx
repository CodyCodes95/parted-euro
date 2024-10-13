import { useState } from "react";
import Modal from "../modals/ModalNew";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import type { GetAllListingsAdminOutput } from "../../utils/trpc";
import { type CheckoutItem } from "@/pages/api/checkout";
import { Label } from "../ui/label";

type AddToOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: GetAllListingsAdminOutput;
  title: string;
  setOrder: (order: CheckoutItem[]) => void;
  order: CheckoutItem[] | undefined;
};

const AddToOrder = ({
  isOpen,
  onClose,
  listing,
  title,
  setOrder,
  order,
}: AddToOrderProps) => {
  const [price, setPrice] = useState(`${listing.price}`);
  const [quantity, setQuantity] = useState("1");

  const addToOrder = () => {
    if (!price || !quantity) {
      toast.error("Please enter both price and quantity");
      return;
    }

    const updatedListing = {
      itemId: listing.id,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    };

    setOrder(order ? [...order, updatedListing] : [updatedListing]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 p-4">
        {listing.parts.map((part, index) => (
          <a
            className="text-blue-500 hover:underline"
            href={`/listings/${listing.id}`}
            key={index}
          >
            {part.partDetails.name} - {part.donorVin}
          </a>
        ))}
        <div className="flex flex-col gap-4">
          <Label>Price</Label>
          <Input
            className="pl-4"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Label>Quantity</Label>
          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button onClick={addToOrder}>Add</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddToOrder;
