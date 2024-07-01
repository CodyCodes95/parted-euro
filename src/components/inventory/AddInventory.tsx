import ModalNew from "../modals/ModalNew";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ReactSelect from "react-select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";

type AddInventoryProps = {
  existingDonor?: string;
  isOpen: boolean;
  onClose: () => void;
};

const AddInventory = ({
  existingDonor,
  isOpen,
  onClose,
}: AddInventoryProps) => {
  const [donorVin, setDonorVin] = useState(existingDonor || "");
  const [variant, setVariant] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>();
  const [inventoryLocation, setInventoryLocation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [newInventoryLocation, setNewInventoryLocation] = useState<
    string | undefined
  >();

  const inventoryLocations = trpc.inventoryLocations.getAll.useQuery();
  const parts = trpc.partDetails.getAll.useQuery();
  const donors = trpc.donors.getAll.useQuery();

  const savePart = trpc.parts.createPart.useMutation();
  const saveInventoryLocationMutation =
    trpc.inventoryLocations.createInventoryLocation.useMutation();

  const saveInventoryLocation = async () => {
    if (!newInventoryLocation) return toast.error("Please enter a location");
    await saveInventoryLocationMutation.mutateAsync({
      name: newInventoryLocation,
    });
    await inventoryLocations.refetch();
    setInventoryLocation(
      inventoryLocations.data?.find(
        (location) => location.name === newInventoryLocation
      )?.id || ""
    );
    setNewInventoryLocation(undefined);
  };

  const onSave = async () => {
    if (!selectedParts?.length)
      return toast.error("Please select at least one part");
    await Promise.all(
      selectedParts.map(async (partNo) => {
        await savePart.mutateAsync({
          partDetailsId: partNo,
          donorVin,
          variant,
          quantity,
          inventoryLocationId: inventoryLocation,
        });
      })
    );
    toast.success(`Parts assigned to ${donorVin}`);
    setVariant("");
    setSelectedParts([]);
    setInventoryLocation("");
    setQuantity(1);
  };

  return (
    <ModalNew isOpen={isOpen} onClose={onClose} title="Add Inventory">
      <div className="flex w-full flex-col gap-6 p-4">
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Donor Car (Donor)
          </label>
          <ReactSelect
            closeMenuOnSelect
            placeholder={"Select a donor"}
            // isDisabled={donorVin ? true : false}
            options={donors.data?.map((donor) => {
              return {
                label: donor.vin,
                value: donor.vin,
              };
            })}
            value={{
              label: donorVin,
              value: donorVin,
            }}
            onChange={(e) => {
              setDonorVin(e?.value || "");
            }}
          />
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
            value={selectedParts?.map((partNo) => {
              return {
                label: parts.data?.find((part) => part.partNo === partNo)?.name,
                value: partNo,
              };
            })}
            onChange={(e) => {
              setSelectedParts(e?.map((part) => part.value) || []);
            }}
            closeMenuOnSelect={false}
          />
        </div>
        <div className="">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Location
          </label>
          <div className="flex w-full items-center gap-2">
            {typeof newInventoryLocation === "string" ? (
              <>
                <Input value={newInventoryLocation} onChange={(e) => setNewInventoryLocation(e.target.value)} />
                <div
                  onClick={() => saveInventoryLocation()}
                  className="cursor-pointer rounded-md bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <Save />
                </div>
              </>
            ) : (
              <>
                <ReactSelect
                  className="w-full"
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
                              (location) => location.id === inventoryLocation
                            )?.name || "",
                          value: inventoryLocation,
                        }
                      : { lavbel: "", value: "" }
                  }
                  onChange={(e) => {
                    setInventoryLocation(e?.value || "");
                  }}
                />
                <div
                  onClick={() => setNewInventoryLocation("")}
                  className="cursor-pointer rounded-md bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <Plus />
                </div>
              </>
            )}
          </div>
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
        <div className="flex w-full justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </ModalNew>
  );
};

export default AddInventory;
