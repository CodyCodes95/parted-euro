import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import type { Car } from "@prisma/client";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import IconButton from "@mui/material/IconButton";

interface AddDonorProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  donor: any | null;
}

interface ISelectOptions {
  label: string;
  value: string;
}

const AddDonor: React.FC<AddDonorProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  donor,
}) => {
  const [vin, setVin] = useState<string>(donor?.vin || "");
  const [cost, setCost] = useState<number>(donor?.cost || 0);
  const [carId, setCarId] = useState<string>(donor?.car.id || "");
  const [year, setYear] = useState<number>(donor?.year || 0);
  const [mileage, setMileage] = useState<number>(donor?.mileage || 0);
  const [options, setOptions] = useState<ISelectOptions[]>([]);
  const [images, setImages] = useState<Array<string>>([]);

  const cars = trpc.cars.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setOptions([]);
      data.forEach((car: Car) => {
        setOptions((prevState: any) => {
          if (prevState.some((group: any) => group.label === car.series)) {
            return prevState.map((group: any) => {
              if (group.label === car.series) {
                group.options.push({
                  label: `${car.generation} ${car.model} ${car.body || ""}`,
                  value: car.id,
                });
              }
              return group;
            });
          } else {
            return [
              ...prevState,
              {
                label: car.series,
                options: [
                  {
                    label: `${car.generation} ${car.model} ${car.body || ""}`,
                    value: car.id,
                  },
                ],
              },
            ];
          }
        });
      });
    },
    onError: (err: any) => {
      error(err.message);
    },
  });
  const saveDonor = trpc.donors.createDonor.useMutation();
  const updateDonor = trpc.donors.updateDonor.useMutation();
  const uploadImage = trpc.images.uploadDonorImage.useMutation();

  const onSave = async () => {
    if (donor) {
      console.log(donor);
      const result = await updateDonor.mutateAsync(
        {
          vin: vin,
          cost: Math.round(cost),
          carId: carId,
          year: year,
          mileage: mileage,
        },
        {
          onError: (err: any) => {
            error(err.message);
          },
        }
      );
      success(`Donor ${vin} successfully updated`);
      setMileage(0);
      setVin("");
      setCost(0);
      setCarId("");
      setYear(0);
      setImages([]);
      setShowModal(false);
      return;
    }

    const result = await saveDonor.mutateAsync(
      {
        vin: vin,
        cost: Math.round(cost),
        carId: carId,
        year: year,
        mileage: mileage,
      },
      {
        onError: (err: any) => {
          error(err.message);
        },
      }
    );
    const donorVin = result.vin;
    const imagePromises = images.map(async (image: string, i:number) => {
      return await uploadImage.mutateAsync({
        image: image,
        donorVin: donorVin,
        order: i,
      });
    });
    await Promise.all(imagePromises);
    success(`Donor ${vin} successfully created`);
    setMileage(0);
    setVin("");
    setCost(0);
    setCarId("");
    setYear(0);
    setImages([]);
    setShowModal(false);
  };

  const handleImageAttach = () => {
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
              Add a donor
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
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Car
              </label>
              <Select
                onChange={(e: any) => setCarId(e.value)}
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
                disabled={donor ? true : false}
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
            {donor ? null : (
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
            )}
          </div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              onClick={() => onSave()}
              data-modal-toggle="defaultModal"
              type="button"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonor;
