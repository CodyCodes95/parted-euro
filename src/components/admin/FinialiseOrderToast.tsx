import { type CheckoutItem } from "@/pages/api/checkout";
import type { OrderItem } from "../../pages/admin/listings";

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
  setShowFinialiseOrder: (showFinialiseOrder: boolean) => void;
};

const FinialiseOrderToast = ({
  order,
  setShowFinialiseOrder,
}: FinialiseOrderToastProps) => {
  if (!order?.length) return null;

  return (
    <div className="flex w-full items-center justify-between">
      <p>{order?.length} items in order</p>
      <Button
        onClick={() => {
          setShowFinialiseOrder(true);
        }}
      >
        Finialise
      </Button>
    </div>
  );
};

export default FinialiseOrderToast;
