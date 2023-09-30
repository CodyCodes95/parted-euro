import type { OrderItem } from "../../pages/admin/listings";
import { trpc } from "../../utils/trpc";
import ModalNew from "./ModalNew";

type FinialiseOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem[];
};

const FinialiseOrder = ({ isOpen, onClose, order }: FinialiseOrderProps) => {
  const inventoryItems = trpc.parts.getInventoryDetailsById.useQuery(
    order.map((item) => ({ id: item.inventoryId }))
  );
  return (
    <ModalNew isOpen={isOpen} onClose={onClose} title="Finialise Orer">
          <div className="flex flex-col p-4">
                
            </div>
    </ModalNew>
  );
};

export default FinialiseOrder;
