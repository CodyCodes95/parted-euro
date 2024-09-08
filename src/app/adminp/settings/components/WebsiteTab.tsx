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
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Compressor from "compressorjs";
import { FaCamera } from "react-icons/fa";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { DragOverlay } from "@dnd-kit/core";
import LoadingSpinner from "@/components/ui/Loader";
import { Loader2 } from "lucide-react";

type HomepageImage = {
  id: string;
  url: string;
  order: number;
};

interface WebsiteTabClientProps {
  initialImages: HomepageImage[];
}

const WebsiteTab = () => {
  const websiteImages = trpc.homepageImages.getAll.useQuery();

  if (!websiteImages.data)
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin" />
      </div>
    );

  return <WebsiteTabClient initialImages={websiteImages.data} />;
};

export default WebsiteTab;

const WebsiteTabClient: React.FC<WebsiteTabClientProps> = ({
  initialImages,
}) => {
  const [images, setImages] = useState<HomepageImage[]>(initialImages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = trpc.homepageImages.upload.useMutation({
    onSuccess: (uploadedImage) => {
      setImages((prevImages) => [...prevImages, uploadedImage]);
      toast.success("Image uploaded successfully");
      if (photoUploadRef.current) {
        photoUploadRef.current.value = "";
      }
    },
    onError: (error) => {
      toast.error("Failed to upload image: " + error.message);
    },
  });
  const updateOrder = trpc.homepageImages.updateOrder.useMutation();
  const deleteImage = trpc.homepageImages.delete.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setImages((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);

          const newOrder = arrayMove(items, oldIndex, newIndex);
          void updateOrder.mutate(
            newOrder.map((item, index) => ({ id: item.id, order: index })),
          );
          return newOrder;
        });
      }

      setActiveId(null);
    },
    [updateOrder],
  );

  const handleImageAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      try {
        const compressedImage = await new Promise<string>((resolve, reject) => {
          new Compressor(file, {
            quality: 0.8,
            maxHeight: 4000,
            maxWidth: 4000,
            success(result) {
              const reader = new FileReader();
              reader.onload = (event) =>
                resolve(event.target?.result as string);
              reader.readAsDataURL(result);
            },
            error(err) {
              reject(err);
            },
          });
        });

        uploadImageMutation.mutate({ image: compressedImage });
      } catch (error) {
        toast.error("Failed to compress image");
        if (photoUploadRef.current) {
          photoUploadRef.current.value = "";
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteImage.mutateAsync({ id });
      setImages((prevImages) => prevImages.filter((img) => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Homepage Images</h2>
        <div>
          <input
            type="file"
            ref={photoUploadRef}
            onChange={handleImageAttach}
            className="hidden"
          />
          <Button
            onClick={() => photoUploadRef.current?.click()}
            disabled={uploadImageMutation.isLoading}
            className="gap-2"
          >
            {uploadImageMutation.isLoading ? (
              "Uploading..."
            ) : (
              <>
                <FaCamera /> Upload
              </>
            )}
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          {images.map((image) => (
            <SortableItem
              key={image.id}
              id={image.id}
              url={image.url}
              onDelete={() => handleDelete(image.id)}
              isDeleting={deletingId === image.id}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="h-40 w-full rounded-md bg-gray-200 opacity-50" />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

type SortableItemProps = {
  id: string;
  url: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function SortableItem({ id, url, onDelete, isDeleting }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="flex items-center gap-4">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex flex-grow items-center gap-4 rounded-md bg-white p-2 shadow-sm transition-colors duration-200 ease-in-out"
      >
        <div className="cursor-move">☰</div>
        <div className="flex-grow">
          <img
            src={url}
            alt="Homepage image"
            className="h-80 w-full rounded-md object-cover"
          />
        </div>
      </div>
      <Button onClick={() => onDelete(id)} disabled={isDeleting}>
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
