import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import { Input } from "@material-tailwind/react";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "../LoadingButton";
import Compressor from "compressorjs";

interface AddListingProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
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
}) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [images, setImages] = useState<Array<string>>([]);
  const [parts, setParts] = useState<Array<string>>([]);
  const [partOptions, setPartOptions] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
  const uploadImage = trpc.listings.uploadListingImage.useMutation();
  const createImageRecord = trpc.images.createImageRecord.useMutation();

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
        success(result) {
          reader.readAsDataURL(result);
        },
      });
    });
  };

  const onSave = async () => {
    // if (1 === 1) {
    // Add some validation in here maybe???
    //   error("AHH")
    //   console.log("ERR")
    //   return
    // }
    setLoading(true);
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
    const imagePromises = images.map(async (image: string) => {
      return await uploadImage.mutateAsync({
        image: image,
      });
    });
    await Promise.all([...imagePromises]);
    success("Listing created successfully");
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
