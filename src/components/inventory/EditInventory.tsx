import type { Part } from "@prisma/client";
import ModalNew from "../modals/ModalNew";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ReactSelect from "react-select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

type EditInventoryModalProps = {
  existingDonor: string;
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: Part;
};

const EditInventoryModal = ({
  existingDonor,
  isOpen,
  onClose,
  inventoryItem,
}: EditInventoryModalProps) => {
  const [variant, setVariant] = useState<string>(inventoryItem?.variant || "");
  const [partDetailsId, setPartDetailsId] = useState(
    inventoryItem?.partDetailsId || ""
  );
  const [inventoryLocation, setInventoryLocation] = useState<string>(
    inventoryItem?.inventoryLocationId || ""
  );
  const [quantity, setQuantity] = useState<number>(
    inventoryItem?.quantity || 1
  );

  const inventoryLocations = trpc.inventoryLocations.getAll.useQuery();
  const parts = trpc.partDetails.getAll.useQuery();
  const donors = trpc.donors.getAll.useQuery();

  const savePart = trpc.parts.updateInventory.useMutation();

  const onSave = async () => {
    await savePart.mutateAsync({
      id: inventoryItem.id,
      variant,
      quantity,
      inventoryLocationId: inventoryLocation,
    });
    toast.success(`Part updated`);
    onClose();
  };

  return (
    <ModalNew isOpen={isOpen} onClose={onClose} title="Add Inventory">
      <div className="flex w-full flex-col gap-6 p-4">
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Donor Car (Donor)
          </label>
          <Input value={existingDonor} disabled={true} />
        </div>
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Parts
          </label>
          <ReactSelect
            placeholder="Select parts"
            isMulti
            options={parts.data?.map((part) => {
              return {
                label: part.name,
                value: part.partNo,
              };
            })}
            value={{
              value: partDetailsId,
              label: parts.data?.find((part) => part.partNo === partDetailsId)
                ?.name,
            }}
            isDisabled={true}
            closeMenuOnSelect
          />
        </div>
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Quantity
          </label>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Variant (Optional)
          </label>
          <Input value={variant} onChange={(e) => setVariant(e.target.value)} />
        </div>
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Location
          </label>
          <ReactSelect
            placeholder={"Select a location"}
            options={inventoryLocations.data?.map((location) => {
              return {
                label: location.name,
                value: location.id,
              };
            })}
            value={
              inventoryLocation
                ? {
                    label:
                      inventoryLocations.data?.find(
                        (location) => location.id === inventoryLocation,
                      )?.name || "",
                    value: inventoryLocation,
                  }
                : { lavbel: "", value: "" }
            }
            onChange={(e) => {
              setInventoryLocation(e?.value || "");
            }}
          />
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </ModalNew>
  );
};

export default EditInventoryModal;
