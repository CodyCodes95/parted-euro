import Modal from "../modals/ModalNew";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { GetAllListingsAdminOutput } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import type { OrderItem } from "../../pages/admin/listings";

type AddToOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: GetAllListingsAdminOutput;
  title: string;
  setOrder: React.Dispatch<React.SetStateAction<OrderItem[] | undefined>>;
};

const AddToOrder = ({
  isOpen,
  onClose,
  listing,
  title,
  setOrder,
}: AddToOrderProps) => {
  const [itemsToSell, setItemsToSell] = useState<OrderItem[] | null>(null);

  const addToOrder = () => {
    if (itemsToSell === null) {
      return toast.error("Please select items to sell");
    }
    setOrder((prev) => {
      if (prev === undefined) {
        return itemsToSell;
      }
      return [...prev, ...itemsToSell];
    });
    onClose();
  };

  const onItemSelected = (quantity: string, inventoryId: string) => {
    setItemsToSell((prev) => {
      if (prev === null) {
        return [{ inventoryId, quantity: parseInt(quantity), price: 0 }];
      }
      const index = prev.findIndex((item) => item.inventoryId === inventoryId);
      if (index === -1) {
        return [
          ...prev,
          {
            inventoryId,
            quantity: parseInt(quantity),
            price: 0,
          },
        ];
      }
      prev[index]!.quantity = parseInt(quantity);
      return prev;
    });
  };

  const setItemPrice = (price: number, inventoryId: string) => {
    setItemsToSell((prev) => {
      if (prev === null) {
        return [{ inventoryId, price, quantity: 0 }];
      }
      const index = prev.findIndex((item) => item.inventoryId === inventoryId);
      if (index === -1) {
        return [...prev, { inventoryId, price, quantity: 0  }];
      }
      console.log(price)
      prev[index]!.price = price;
      return prev;
    });
  };

  useEffect(() => {
    console.log(itemsToSell);
  }, [itemsToSell]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-3 gap-4 p-4">
          {listing.parts.map((part) => (
            <>
              <p>
                {part.partDetails.name} - {part.donorVin}
              </p>
              <Select onValueChange={(e) => onItemSelected(e, part.id)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Quantity" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(Array(part.quantity).keys()).map((i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {(i + 1).toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="w-44"
                placeholder="Price"
                type="number"
                onChange={(e) =>
                  setItemPrice(parseInt(e.target.value), part.id)
                }
              />
            </>
          ))}
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button onClick={addToOrder}>Add</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddToOrder;
