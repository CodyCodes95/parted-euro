import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import { Input } from "@material-tailwind/react";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "../LoadingButton";
import Compressor from "compressorjs";
import type { Image, Listing, Part, PartDetail } from "@prisma/client";
import SortableList, { SortableItem } from "react-easy-sort";

interface AddListingProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  refetch: () => void;
  listing:
    | (Listing & {
        images: Image[];
        parts: (Part & {
          partDetails: PartDetail;
        })[];
      })
    | null;
}

interface Options {
  label: string;
  value: string;
}

const AddListing: React.FC<AddListingProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  listing,
  refetch
}) => {
  const [title, setTitle] = useState<string>(listing?.title || "");
  const [description, setDescription] = useState<string>(
    listing?.description || ""
  );
  const [condition, setCondition] = useState<string>(listing?.condition || "");
  const [price, setPrice] = useState<number>(listing?.price || 0);
  const [weight, setWeight] = useState<number>(listing?.weight || 0);
  const [length, setLength] = useState<number>(listing?.length || 0);
  const [width, setWidth] = useState<number>(listing?.width || 0);
  const [height, setHeight] = useState<number>(listing?.height || 0);
  const [images, setImages] = useState<Array<string>>([]);
  const [parts, setParts] = useState<Array<string>>([]);
  const [partOptions, setPartOptions] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<Array<Image> | []>(
    listing?.images || []
  );
  const [showImageSorter, setShowImageSorter] = useState<boolean>(false);

  const donors = trpc.donors.getAllWithParts.useQuery(undefined, {
    onSuccess: (data) => {
      console.log(data);
      const options = data.map((donor: any) => {
        return {
          label: donor.vin,
          options: donor.parts.map((part: any) => {
            return {
              label: `${part.partDetails.name} (${part.partDetails.partNo})`,
              value: part.id,
              tab: donor.vin,
            };
          }),
        };
      });
      setPartOptions(options);
    },
  });

  const saveListing = trpc.listings.createListing.useMutation();
  const updateListing = trpc.listings.updateListing.useMutation();
  const uploadImage = trpc.images.uploadListingImage.useMutation();
  const updateImageOrder = trpc.images.updateImageOrder.useMutation();

  const handleImageAttach = (e: any) => {
    Array.from(e.target.files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (onLoadEvent: any) => {
        setImages((imageState: any) => [
          ...imageState,
          onLoadEvent.target.result,
        ]);
      };
      new Compressor(file, {
        quality: 0.6,
        maxHeight: 1422,
        maxWidth: 800,
        success(result) {
          reader.readAsDataURL(result);
        },
      });
    });
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    const newImages = [...uploadedImages] as Image[];
    const [removedImage] = newImages.splice(oldIndex, 1);
    if (removedImage !== undefined) {
      newImages.splice(newIndex, 0, removedImage);
      setUploadedImages(newImages);
    }
  };

  const runUpdateImageOrder = async () => {
    const imagePromises = uploadedImages.map(
      async (image: Image, i: number) => {
        return await updateImageOrder.mutateAsync({
          id: image.id,
          order: i,
        });
      }
    );
    await Promise.all([...imagePromises]);
    setShowImageSorter(false);
  };

  const onSave = async () => {
    setLoading(true);
    if (listing) {
      const result = await updateListing.mutateAsync(
        {
          id: listing.id,
          title: title,
          description: description,
          condition: condition,
          price: price,
          weight: weight,
          itemLength: length,
          width: width,
          height: height,
        },
        {
          onSuccess: (listing) => {
            console.log(listing);
          },
          onError: (err) => {
            error(err.message);
          },
        }
      );
      const imagePromises = images.map(async (image: string, i: number) => {
        return await uploadImage.mutateAsync({
          listingId: result.id,
          image: image,
          order: i + uploadedImages?.length || 0,
        });
      });
      await Promise.all([...imagePromises]);
      success("Listing updated successfully");
      refetch()
      setShowModal(false);
      setLoading(false);
      setTitle("");
      setDescription("");
      setCondition("");
      setPrice(0);
      setWeight(0);
      setLength(0);
      setWidth(0);
      setHeight(0);
      setImages([]);
      return;
    }
    const result = await saveListing.mutateAsync(
      {
        title: title,
        description: description,
        condition: condition,
        price: price,
        weight: weight,
        itemLength: length,
        width: width,
        height: height,
        parts: parts,
      },
      {
        onSuccess: (listing) => {
          console.log(listing);
        },
        onError: (err) => {
          error(err.message);
        },
      }
    );
    const imagePromises = images.map(async (image: string, i: number) => {
      return await uploadImage.mutateAsync({
        image: image,
        listingId: result.id,
        order: i,
      });
    });
    await Promise.all([...imagePromises]);
    success("Listing created successfully");
    refetch();
    setShowModal(false);
    setLoading(false);
    setTitle("");
    setDescription("");
    setCondition("");
    setPrice(0);
    setWeight(0);
    setLength(0);
    setWidth(0);
    setHeight(0);
    setImages([]);
  };

  if (showImageSorter) {
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
              onSortEnd={onSortEnd}
              draggedItemClassName=""
            >
              {uploadedImages.map((image) => (
                <SortableItem key={image.url}>
                  <img className="h-56 w-32" src={image.url} />
                </SortableItem>
              ))}
            </SortableList>
            <button
              className="mr-2 mt-4 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                runUpdateImageOrder();
              }}
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="defaultModal"
      aria-hidden="true"
      className={`h-modal fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full ${
        showModal ? "" : "hidden"
      }`}
    >
      <ModalBackDrop setShowModal={setShowModal} />
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Listing
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
          <div className="space-y-6 p-6">
            <div className="">
              <Input
                value={title}
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={description}
                label="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={condition}
                label="Condition"
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={price || undefined}
                type="number"
                label="Price"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={weight || undefined}
                type="number"
                label="Weight"
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={length || undefined}
                type="number"
                label="Length"
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={width || undefined}
                type="number"
                label="Width"
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={height || undefined}
                type="number"
                label="Height"
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            {listing ? null : (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Parts
                </label>
                <Select
                  onChange={(e: any) => {
                    setParts(e.map((part: Options) => part.value));
                  }}
                  isMulti
                  options={partOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  closeMenuOnSelect={false}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  multiple={true}
                  onChange={handleImageAttach}
                />
                <PhotoCamera />
              </IconButton>
              <p>{images.length} Photos attached</p>
              <a
                onClick={() => setShowImageSorter(true)}
                className="cursor-pointer text-blue-500"
              >
                Sort Order
              </a>
            </div>
            <LoadingButton
              onClick={onSave}
              loading={loading}
              text="Create Listing"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
