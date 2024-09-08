import { CheckoutItem } from "@/pages/api/checkout";
import type { OrderItem } from "../../pages/admin/listings";
import FinialiseOrder from "../modals/FinialiseOrder";
import { Button } from "../ui/button";
import {
  DialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type FinialiseOrderToastProps = {
  order: CheckoutItem[];
  setOrder: (order: CheckoutItem[]) => void;
};

const FinialiseOrderToast = ({ order, setOrder }: FinialiseOrderToastProps) => {
  if (!order?.length) return null;

  return (
    <div className="flex w-full items-center justify-between">
      <p>{order?.length} items in order</p>
      <Dialog>
        <DialogTrigger>
          <Button>Finialise</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finialise Order</DialogTitle>
            <DialogDescription>
              <FinialiseOrder order={order} setOrder={setOrder} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinialiseOrderToast;
