import { useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import { FaCamera } from "react-icons/fa";
import LoadingButton from "../LoadingButton";
import Compressor from "compressorjs";
import type { Image, Listing, Part, PartDetail } from "@prisma/client";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ImageSorter from "./ImageSorter";
import Modal from "../modals/Modal";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<Array<Image> | []>(
    listing?.images || []
  );
  const [showImageSorter, setShowImageSorter] = useState<boolean>(false);

  const photoUploadRef = useRef<HTMLInputElement>(null);

  const donors = trpc.donors.getAllWithParts.useQuery(undefined, {
    onSuccess: (data) => {
      console.log(data);
      const options = data.map((donor) => {
        return {
          label: donor.vin,
          options: donor.parts.map((part) => {
            return {
              label: `${part.partDetails.name} (${part.partDetails.partNo}) ${
                part.variant ? `- ${part.variant}` : ""
              } `,
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
    <Modal
      isOpen={showModal}
      title={listing ? "Edit Listing" : "Create Listing"}
      setIsOpen={setShowModal}
    >
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
    </Modal>
  );
};

export default AddListing;
