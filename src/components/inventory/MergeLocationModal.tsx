import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import type { InventoryLocations } from "@prisma/client";
import { trpc } from "../../utils/trpc";

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  sourceLocation: InventoryLocations & { _count: { parts: number } };
  locations: (InventoryLocations & { _count: { parts: number } })[];
  refetch: () => Promise<unknown>;
}

export default function MergeLocationModal({
  showModal,
  setShowModal,
  sourceLocation,
  locations,
  refetch,
}: Props) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const mergeLocation = trpc.inventoryLocations.mergeLocations.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });

  const targetLocation = locations.find((loc) => loc.id === selectedTargetId);

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge Location</DialogTitle>
          <DialogDescription>
            Select which location you want to merge {sourceLocation.name} into.
            {sourceLocation._count.parts > 0 && (
              <p className="mt-2 text-red-500">
                Warning: This will move {sourceLocation._count.parts} items to
                the new location.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedTargetId}
            onValueChange={(value) => setSelectedTargetId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target location" />
            </SelectTrigger>
            <SelectContent>
              {locations
                .filter((loc) => loc.id !== sourceLocation.id)
                .map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location._count.parts} items)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTargetId && targetLocation && (
          <DialogDescription className="text-amber-600">
            This will:
            <ul className="list-disc pl-5">
              <li>Delete the location &quot;{sourceLocation.name}&quot;</li>
              <li>
                Move {sourceLocation._count.parts} items to &quot;
                {targetLocation.name}&quot;
              </li>
            </ul>
          </DialogDescription>
        )}

        <DialogFooter>
          <Button variant="outline" onMouseDown={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onMouseDown={() => {
              if (selectedTargetId) {
                mergeLocation.mutate({
                  sourceId: sourceLocation.id,
                  targetId: selectedTargetId,
                });
              }
            }}
            disabled={!selectedTargetId || mergeLocation.isLoading}
          >
            {mergeLocation.isLoading ? "Merging..." : "Merge Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
