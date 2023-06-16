import { useEffect, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import { FaCamera } from "react-icons/fa";
import LoadingButton from "../LoadingButton";
import Compressor from "compressorjs";
import type { Image, Listing, Part, PartDetail } from "@prisma/client";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ImageSorter from "./ImageSorter";

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
  refetch,
}) => {
  const [title, setTitle] = useState<string>(listing?.title || "");
  const [description, setDescription] = useState<string>(
    listing?.description || ""
  );
  const [condition, setCondition] = useState<string>(listing?.condition || "");
  const [price, setPrice] = useState<number>(listing?.price || 0);
  const [images, setImages] = useState<Array<string>>([]);
  const [parts, setParts] = useState<Array<string>>([]);
  const [partOptions, setPartOptions] = useState<any>([]);
  const [quantity, setQuantity] = useState<number>(listing?.quantity || 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<Array<Image> | []>(
    listing?.images || []
  );
  const [showImageSorter, setShowImageSorter] = useState<boolean>(false);

  const photoUploadRef = useRef<HTMLInputElement>(null);

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
  const deleteImage = trpc.images.deleteImage.useMutation();

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

  const onImageDelete = async (image: Image) => {
    await deleteImage.mutateAsync({ id: image.id });
    setUploadedImages((uploadedImages) =>
      uploadedImages.filter((img) => img.id !== image.id)
    );
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
          quantity: quantity,
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
      refetch();
      setShowModal(false);
      setLoading(false);
      setTitle("");
      setDescription("");
      setCondition("");
      setPrice(0);
      setImages([]);
      return;
    }
    const result = await saveListing.mutateAsync(
      {
        title: title,
        description: description,
        condition: condition,
        price: price,
        parts: parts,
        quantity: quantity,
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
    setImages([]);
  };

  useEffect(() => {
    console.log(images);
  }, [images]);

  if (showImageSorter && listing) {
    return (
      <ImageSorter
        setImages={setUploadedImages}
        images={uploadedImages}
        setShowModal={setShowImageSorter}
        showModal={showImageSorter}
      />
    );
  }

  if (showImageSorter && !listing) {
    return (
      <ImageSorter
        setImages={setImages}
        images={images}
        setShowModal={setShowImageSorter}
        showModal={showImageSorter}
      />
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
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="">
              <Textarea
                value={description}
                rows={4}
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={condition}
                placeholder="Condition"
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={price || undefined}
                type="number"
                placeholder="Price"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={quantity || undefined}
                type="number"
                placeholder="Quantity"
                onChange={(e) => setQuantity(Number(e.target.value))}
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
              <div onClick={() => photoUploadRef.current?.click()}>
                <input
                  hidden
                  ref={photoUploadRef}
                  accept="image/*"
                  type="file"
                  multiple={true}
                  onChange={handleImageAttach}
                />
                <FaCamera className="text-xl text-blue-500" />
              </div>
              <p>{uploadedImages.length || images.length} Photos attached</p>
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
