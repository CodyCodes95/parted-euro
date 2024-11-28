import { useRef, useState } from "react";
import type { QueryListingsGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import { FaCamera } from "react-icons/fa";
import Compressor from "compressorjs";
import type { Image } from "@prisma/client";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ImageSorter from "./ImageSorter";
import Modal from "../modals/Modal";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

interface AddListingProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: () => void;
  listing: QueryListingsGetAllAdmin | undefined;
}

const AddListing: React.FC<AddListingProps> = ({
  showModal,
  setShowModal,
  listing,
  refetch,
}) => {
  console.log(listing?.title);
  const [title, setTitle] = useState<string>(listing?.title || "");
  const [description, setDescription] = useState<string>(
    listing?.description || "",
  );
  const [condition, setCondition] = useState<string>(listing?.condition || "");

  // Add this new constant for condition options
  const conditionOptions = [
    { label: "New", value: "NEW" },
    { label: "Used", value: "USED_EXCELLENT" },
    { label: "For Parts Or Not Working", value: "FOR_PARTS_OR_NOT_WORKING" },
  ];

  const [price, setPrice] = useState<number>(listing?.price || 0);
  const [images, setImages] = useState<Array<string>>([]);
  const [parts, setParts] = useQueryState<Array<string>>(
    "parts",
    parseAsArrayOf(parseAsString).withDefault(
      listing ? listing.parts.map((part) => part.id) : [],
    ),
  );
  const [uploadedImages, setUploadedImages] = useState<Array<Image> | []>(
    listing?.images || [],
  );
  const [showImageSorter, setShowImageSorter] = useState<boolean>(false);

  const photoUploadRef = useRef<HTMLInputElement>(null);

  const partOptions = trpc.donors.getAllWithParts.useQuery();

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
    if (listing?.id) {
      const result = await updateListing.mutateAsync(
        {
          id: listing.id,
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
            toast.error(err.message);
          },
        },
      );
      const imagePromises = images.map(async (image: string, i: number) => {
        return await uploadImage.mutateAsync({
          listingId: result.id,
          image: image,
          order: i + uploadedImages?.length || 0,
        });
      });
      await Promise.all([...imagePromises]);
      toast.success("Listing updated successfully");
      refetch();
      setShowModal(false);
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
          toast.error(err.message);
        },
      },
    );
    const imagePromises = images.map(async (image: string, i: number) => {
      return await uploadImage.mutateAsync({
        image: image,
        listingId: result.id,
        order: i,
      });
    });
    await Promise.all([...imagePromises]);
    toast.success("Listing created successfully");
    refetch();
    setShowModal(false);
    setTitle("");
    setDescription("");
    setCondition("");
    setPrice(0);
    setImages([]);
  };

  if (showImageSorter && listing?.id) {
    return (
      <ImageSorter
        setImages={setUploadedImages}
        images={uploadedImages}
        setShowModal={setShowImageSorter}
        showModal={showImageSorter}
      />
    );
  }

  if (showImageSorter && !listing?.id) {
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
      title={listing?.id ? "Edit Listing" : "Create Listing"}
      setIsOpen={() => {
        void setParts([]);
        setShowModal(false);
      }}
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
          <Select
            value={conditionOptions.find(
              (option) => option.value === condition,
            )}
            options={conditionOptions}
            onChange={(selectedOption) =>
              setCondition(selectedOption?.value || "")
            }
            placeholder="Condition"
            className="basic-select"
            classNamePrefix="select"
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
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Parts
          </label>
          <Select
            onChange={(e: any) => {
              setParts(e.map((part: any) => part.value));
            }}
            isMulti
            styles={{
              option: (styles, { data }) => ({
                ...styles,
                // @ts-ignore
                color: data.listing ? "green" : "black",
              }),
            }}
            options={partOptions.data}
            value={partOptions.data?.reduce((acc: any[], part) => {
              part.options.forEach((option) => {
                if (parts.includes(option.value)) {
                  acc.push(option);
                }
              });
              return acc;
            }, [])}
            className="basic-multi-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
          />
        </div>
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
        <Button onClick={onSave}>Create Listing</Button>
      </div>
    </Modal>
  );
};

export default AddListing;
