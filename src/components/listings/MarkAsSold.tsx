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
import toast from "react-hot-toast";

type MarkAsSoldProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: GetAllListingsAdminOutput;
  title: string;
};

const MarkAsSold = ({ isOpen, onClose, listing, title }: MarkAsSoldProps) => {
  const [itemsToSell, setItemsToSell] = useState<
    | {
        inventoryId: string;
        quantity: number;
      }[]
    | null
  >(null);
  const [salePrice, setSalePrice] = useState<string>("");

  const updateInventoryQuantity = trpc.parts.decreaseQuantity.useMutation();

  const markAsSold = async () => {
    if (itemsToSell === null) {
      return toast.error("Please select items to sell");
    }
    await Promise.all(
      itemsToSell.map(async (item) => {
        await updateInventoryQuantity.mutateAsync({
          id: item.inventoryId,
          quantity: item.quantity,
        });
      })
    );
    onClose();
  };

  const onItemSelected = (quantity: string, inventoryId: string) => {
    setItemsToSell((prev) => {
      if (prev === null) {
        return [{ inventoryId, quantity: parseInt(quantity) }];
      }
      const index = prev.findIndex((item) => item.inventoryId === inventoryId);
      if (index === -1) {
        return [...prev, { inventoryId, quantity: parseInt(quantity) }];
      }
      prev[index]!.quantity = parseInt(quantity);
      return prev;
    });
  };

  useEffect(() => {
    console.log(itemsToSell);
  }, [itemsToSell]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 p-4">
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
            </>
          ))}
        </div>
        <div className="flex w-full justify-end gap-2">
          <Input
            className="w-44"
            onChange={(e) => setSalePrice(e.target.value)}
            value={salePrice}
            placeholder="Sale Price"
          />
          <Button onClick={markAsSold}>Enter</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MarkAsSold;
