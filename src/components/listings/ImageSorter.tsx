import { trpc } from "../../utils/trpc";
import Modal from "../modals/Modal";
import SortableList, { SortableItem } from "react-easy-sort";
import { RxCross2 } from "react-icons/rx";

type ImageSorterProps = {
  showModal: boolean;
  setShowModal: any;
  images: any[];
  setImages: any;
};

const ImageSorter: React.FC<ImageSorterProps> = ({
  setImages,
  setShowModal,
  showModal,
  images,
}) => {
  const deleteImage = trpc.images.deleteImage.useMutation();
  const updateImageOrder = trpc.images.updateImageOrder.useMutation();
  const onSortEnd = (
    oldIndex: number,
    newIndex: number,
    images: string[],
    setImages: any,
  ) => {
    const newImages = [...images] as any[];
    const [removedImage] = newImages.splice(oldIndex, 1);
    if (removedImage !== undefined) {
      newImages.splice(newIndex, 0, removedImage);
      setImages(newImages);
    }
  };

  const runUpdateImageOrder = async () => {
    const imagePromises = images.map(async (image: any, i: number) => {
      return await updateImageOrder.mutateAsync({
        id: image.id,
        order: i,
      });
    });
    await Promise.all([...imagePromises]);
    setShowModal(false);
  };

  const onImageDelete = async (image: any) => {
    if (image.url) {
      await deleteImage.mutateAsync({ id: image.id });
      setImages((uploadedImages: any) =>
        uploadedImages.filter((img: any) => img.id !== image.id),
      );
    } else {
      setImages((uploadedImages: any) =>
        uploadedImages.filter((img: any) => img !== image),
      );
    }
  };

  return (
    <Modal isOpen={showModal} setIsOpen={setShowModal} title="Sort Images">
      <SortableList
        className="flex flex-wrap items-center"
        onSortEnd={(oldIndex, newIndex) =>
          onSortEnd(oldIndex, newIndex, images, setImages)
        }
        draggedItemClassName=""
      >
        {images.map((image) => (
          <SortableItem key={image.url || image}>
            <div className="relative">
              <RxCross2
                onMouseDown={() => onImageDelete(image)}
                className="absolute right-0 cursor-pointer text-xl text-red-500"
              />
              <img className="h-56 w-32" src={image.url || image} />
            </div>
          </SortableItem>
        ))}
      </SortableList>
      <button
        className="mb-2 mr-2 mt-4 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onMouseDown={() => {
          if (images[0].url) {
            runUpdateImageOrder();
          } else {
            setShowModal(false);
          }
        }}
      >
        Save Order
      </button>
    </Modal>
  );
};

export default ImageSorter;
