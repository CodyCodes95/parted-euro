import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
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
    setImages: any
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
        uploadedImages.filter((img: any) => img.id !== image.id)
      );
    } else {
      setImages((uploadedImages: any) =>
        uploadedImages.filter((img: any) => img !== image)
      );
    }
  };

  return (
    <div
      id="defaultModal"
      aria-hidden="true"
      className={`h-modal fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full ${
        showModal ? "" : "hidden"
      }`}
    >
      <ModalBackDrop setShowModal={setShowModal} />
      <div className="relative h-full w-full max-w-4xl md:h-auto">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sort Images
            </h3>
            <button
              onClick={() => setShowModal(!showModal) as any}
              type="button"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="defaultModal"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
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
                    onClick={() => onImageDelete(image)}
                    className="absolute right-0 cursor-pointer text-xl text-red-500"
                  />
                  <img className="h-56 w-32" src={image.url || image} />
                </div>
              </SortableItem>
            ))}
          </SortableList>
          <button
            className="mr-2 mt-4 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              if (images[0].url) {
                runUpdateImageOrder();
              } else {
                setShowModal(false);
              }
            }}
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSorter;
