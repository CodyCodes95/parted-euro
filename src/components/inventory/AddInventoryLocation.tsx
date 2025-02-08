import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import type { InventoryLocations } from "@prisma/client";

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selection?: InventoryLocations;
  refetch: () => Promise<unknown>;
}

const AddInventoryLocation = ({
  showModal,
  setShowModal,
  selection,
  refetch,
}: Props) => {
  const [name, setName] = useState(selection?.name ?? "");

  const createLocation = trpc.inventoryLocations.createLocation.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });

  const updateLocation = trpc.inventoryLocations.updateLocation.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });

  const handleSubmit = () => {
    if (selection) {
      updateLocation.mutate({
        id: selection.id,
        name,
      });
    } else {
      createLocation.mutate({
        name,
      });
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selection ? "Edit Location" : "Add New Location"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onMouseDown={handleSubmit}>
            {selection ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryLocation;
