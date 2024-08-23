import { useState, useCallback, useRef } from "react";
import { trpc } from "@/utils/trpc";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Compressor from "compressorjs";
import { FaCamera } from "react-icons/fa";

const WebsiteTab = () => {
  const [images, setImages] = useState<
    { id: string; url: string; order: number }[]
  >([]);
  const [newImage, setNewImage] = useState<string | null>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);

  const { data: homepageImages, refetch } =
    trpc.homepageImages.getAll.useQuery();
  const uploadImage = trpc.homepageImages.upload.useMutation();
  const updateOrder = trpc.homepageImages.updateOrder.useMutation();
  const deleteImage = trpc.homepageImages.delete.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setImages((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);

          const newOrder = arrayMove(items, oldIndex, newIndex);
          updateOrder.mutate(
            newOrder.map((item, index) => ({ id: item.id, order: index })),
          );
          return newOrder;
        });
      }
    },
    [updateOrder],
  );

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (onLoadEvent: ProgressEvent<FileReader>) => {
        new Compressor(file, {
          quality: 0.6,
          maxHeight: 1422,
          maxWidth: 800,
          success(result) {
            const compressedReader = new FileReader();
            compressedReader.onload = (
              compressedEvent: ProgressEvent<FileReader>,
            ) => {
              setNewImage(compressedEvent.target?.result as string);
            };
            compressedReader.readAsDataURL(result);
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!newImage) return;

    try {
      await uploadImage.mutateAsync({ image: newImage });
      setNewImage(null);
      void refetch();
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage.mutateAsync({ id });
      void refetch();
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Homepage Carousel Images</h2>
      <div className="flex items-center space-x-4">
        <div onClick={() => photoUploadRef.current?.click()}>
          <input
            hidden
            ref={photoUploadRef}
            accept="image/*"
            type="file"
            onChange={handleImageAttach}
          />
          <FaCamera className="text-xl text-blue-500" />
        </div>
        <Button onClick={handleUpload} disabled={!newImage}>
          Upload
        </Button>
      </div>
      {newImage && (
        <div className="mt-4">
          <p>Preview:</p>
          <img
            src={newImage}
            alt="Preview"
            className="h-32 w-32 object-cover"
          />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {images.map((image) => (
              <SortableItem key={image.id} id={image.id}>
                <div className="flex items-center space-x-4">
                  <img
                    src={image.url}
                    alt="Homepage carousel"
                    className="h-32 w-32 object-cover"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    Delete
                  </Button>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default WebsiteTab;
