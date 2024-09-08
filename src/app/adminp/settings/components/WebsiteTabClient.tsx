"use client";

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
import { toast } from "sonner";
import Compressor from "compressorjs";
import { FaCamera } from "react-icons/fa";

type HomepageImage = {
  id: string;
  url: string;
  order: number;
};

interface WebsiteTabClientProps {
  initialImages: HomepageImage[];
}

const WebsiteTabClient: React.FC<WebsiteTabClientProps> = ({
  initialImages,
}) => {
  const [images, setImages] = useState<HomepageImage[]>(initialImages);
  const [newImage, setNewImage] = useState<string | null>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);

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
      const uploadedImage = await uploadImage.mutateAsync({ image: newImage });
      setImages((prevImages) => [...prevImages, uploadedImage]);
      setNewImage(null);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage.mutateAsync({ id });
      setImages((prevImages) => prevImages.filter((img) => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Homepage Images</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={photoUploadRef}
            onChange={handleImageAttach}
            className="hidden"
          />
          <Button
            onClick={() => photoUploadRef.current?.click()}
          >
            <FaCamera />
          </Button>
          <Button onClick={handleUpload}>Upload</Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          {images.map((image) => (
            <SortableItem
              key={image.id}
              id={image.id}
              url={image.url}
              onDelete={() => handleDelete(image.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default WebsiteTabClient;
