import { useRef, useState } from "react";
import type { QueryDonorGetAllDashboard } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import type { Car, Image } from "@prisma/client";
import { FaCamera } from "react-icons/fa";
import SortableList, { SortableItem } from "react-easy-sort";
import { RxCross2 } from "react-icons/rx";
import Compressor from "compressorjs";
import Modal from "../modals/Modal";
import { toast } from "sonner";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "../../server/trpc/router/_app";
import type { SingleValue } from "react-select";
import type { TRPCError } from "@trpc/server";
import { filesToBase64 } from "@/utils/base64";
import { compressImage } from "@/utils/base64";

interface AddDonorProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  donor: QueryDonorGetAllDashboard | null;
  refetch: () => void;
}

interface GroupedOption {
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

interface SelectOption {
  label: string;
  value: string;
}

const AddDonor: React.FC<AddDonorProps> = ({
  showModal,
  setShowModal,
  donor,
  refetch,
}) => {
  const [vin, setVin] = useState<string>(() => donor?.vin ?? "");
  const [cost, setCost] = useState<number>(() => donor?.cost ?? 0);
  const [carId, setCarId] = useState<string>(() => donor?.car?.id ?? "");
  const [year, setYear] = useState<number>(() => donor?.year ?? 0);
  const [mileage, setMileage] = useState<number>(() => donor?.mileage ?? 0);
  const [options, setOptions] = useState<GroupedOption[]>([]);
  const [images, setImages] = useState<Array<string>>([]);
  const [hideFromSearch, setHideFromSearch] = useState<boolean>(false);
  const [dateInStock, setDateInStock] = useState<string>(
    new Date().toISOString().split("T")[0]!,
  );
  const [uploadedImages, setUploadedImages] = useState<Array<Image>>(
    () => donor?.images ?? [],
  );
  const [showImageSorter, setShowImageSorter] = useState<boolean>(false);
  const photoUploadRef = useRef<HTMLInputElement>(null);

  const saveDonor = trpc.donors.createDonor.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateDonor = trpc.donors.updateDonor.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const uploadImage = trpc.images.uploadDonorImage.useMutation();
  const updateImageOrder = trpc.images.updateImageOrder.useMutation();
  const deleteImage = trpc.images.deleteImage.useMutation();

  const cars = trpc.cars.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setOptions([]);
      data.forEach((car) => {
        setOptions((prevState) => {
          const existingGroup = prevState.find(
            (group) => group.label === car.series,
          );
          if (existingGroup) {
            return prevState.map((group) => {
              if (group.label === car.series) {
                return {
                  ...group,
                  options: [
                    ...group.options,
                    {
                      label: `${car.generation} ${car.model} ${car.body ?? ""}`,
                      value: car.id,
                    },
                  ],
                };
              }
              return group;
            });
          }
          return [
            ...prevState,
            {
              label: car.series,
              options: [
                {
                  label: `${car.generation} ${car.model} ${car.body ?? ""}`,
                  value: car.id,
                },
              ],
            },
          ];
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSave = async () => {
    if (donor) {
      await updateDonor.mutateAsync(
        {
          vin: vin,
          cost: Math.round(cost),
          carId: carId,
          year: year,
          mileage: mileage,
          hideFromSearch: hideFromSearch,
          dateInStock: new Date(dateInStock),
        },
        {
          onError: (err) => {
            toast.error(err.message);
          },
        },
      );
      const imagePromises = images.map(async (image: string, i: number) => {
        return await uploadImage.mutateAsync({
          image: image,
          donorVin: vin,
          order: i,
        });
      });
      await Promise.all(imagePromises);
      toast.success(`Donor ${vin} successfully updated`);
      setMileage(0);
      setVin("");
      setCost(0);
      setCarId("");
      setYear(0);
      setImages([]);
      refetch();
      setShowModal(false);
      return;
    }

    await saveDonor.mutateAsync(
      {
        vin: vin,
        cost: Math.round(cost),
        carId: carId,
        year: year,
        mileage: mileage,
        hideFromSearch,
        dateInStock: new Date(dateInStock),
      },
      {
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
    const imagePromises = images.map(async (image: string, i: number) => {
      return await uploadImage.mutateAsync({
        image: image,
        donorVin: vin,
        order: i,
      });
    });
    await Promise.all(imagePromises);
    toast.success(`Donor ${vin} successfully created`);
    setMileage(0);
    setVin("");
    setCost(0);
    setCarId("");
    setYear(0);
    setImages([]);
    setShowModal(false);
  };

  const runUpdateImageOrder = async () => {
    const imagePromises = uploadedImages.map(
      async (image: Image, i: number) => {
        return await updateImageOrder.mutateAsync({
          id: image.id,
          order: i,
        });
      },
    );
    await Promise.all([...imagePromises]);
    setShowImageSorter(false);
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    const newImages = [...uploadedImages] as Image[];
    const [removedImage] = newImages.splice(oldIndex, 1);
    if (removedImage !== undefined) {
      newImages.splice(newIndex, 0, removedImage);
      setUploadedImages(newImages);
    }
  };

  const onImageDelete = async (image: Image) => {
    await deleteImage.mutateAsync({ id: image.id });
    setUploadedImages((uploadedImages) =>
      uploadedImages.filter((img) => img.id !== image.id),
    );
  };

  if (showImageSorter) {
    return (
      <Modal isOpen={showModal} setIsOpen={setShowModal} title="Image sorter">
        <SortableList
          className="flex flex-wrap items-center"
          onSortEnd={onSortEnd}
          draggedItemClassName=""
        >
          {uploadedImages.map((image) => (
            <SortableItem key={image.url}>
              <div className="relative">
                <RxCross2
                  onMouseDown={() => onImageDelete(image)}
                  className="absolute right-0 cursor-pointer text-xl text-red-500"
                />
                <img className="h-56 w-32" src={image.url} />
              </div>
            </SortableItem>
          ))}
        </SortableList>
        <button
          onMouseDown={() => {
            void runUpdateImageOrder();
          }}
          className="mb-2 mr-2 mt-4 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save Order
        </button>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={showModal}
      setIsOpen={setShowModal}
      title={donor ? `Edit donor ${donor.vin}` : "Add donor"}
    >
      <div className="space-y-6 p-6">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Car
          </label>
          <Select<SelectOption>
            onChange={(selected: SingleValue<SelectOption>) => {
              if (selected) {
                setCarId(selected.value);
              }
            }}
            isDisabled={carId ? true : false}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            VIN
          </label>
          <input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Cost price
          </label>
          <div className="flex">
            {/* <span className="absolute top-[100px]">$</span> */}
            <input
              type="number"
              value={cost ?? undefined}
              onChange={(e) => setCost(Number(e.target.value))}
              className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Year
          </label>
          <input
            type="Number"
            value={year || undefined}
            onChange={(e) => setYear(Number(e.target.value))}
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Mileage
          </label>
          <input
            type="Number"
            value={mileage ?? undefined}
            onChange={(e) => setMileage(Number(e.target.value))}
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Date in stock
          </label>
          <input
            type="date"
            value={dateInStock}
            onChange={(e) => setDateInStock(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
        <div className="mb-6 flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Hide from search
          </label>
          <input
            type="checkbox"
            checked={hideFromSearch}
            onChange={() => setHideFromSearch((prev) => !prev)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div onMouseDown={() => photoUploadRef.current?.click()}>
            <input
              hidden
              ref={photoUploadRef}
              accept="image/*"
              type="file"
              multiple={true}
              onChange={async (e) => {
                const compressedImages = await Promise.all(
                  Array.from(e.target.files!).map(async (file) => {
                    return await compressImage(file);
                  }),
                );
                const base64Images = await filesToBase64(compressedImages);
                setImages(base64Images);
              }}
            />
            <FaCamera className="text-xl text-blue-500" />
          </div>
          <p>{images.length || uploadedImages.length} Photos attached</p>
          <a
            onMouseDown={() => setShowImageSorter(true)}
            className="cursor-pointer text-blue-500"
          >
            Sort Order
          </a>
        </div>
        <button
          onMouseDown={() => onSave()}
          data-modal-toggle="defaultModal"
          type="button"
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default AddDonor;
