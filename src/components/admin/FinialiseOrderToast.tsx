import type { OrderItem } from "../../pages/adminp/listings";
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
  order: OrderItem[];
};

const FinialiseOrderToast = ({ order }: FinialiseOrderToastProps) => {
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
              <FinialiseOrder order={order} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinialiseOrderToast;
