import React, { useEffect, useMemo } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import FormSection from "../FormSection";
import Select, { MultiValue, SingleValue } from "react-select";
import { value } from "@material-tailwind/react/types/components/chip";

interface AddPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ICar {
  id: string;
  make: string;
  series: string;
  generation: string;
  model: string;
}

interface IOrigin {
  vin: string;
  car: ICar;
  year: number;
  cost: number;
}

interface Options {
  label: string;
  value: string;
}

interface NestedOptions {
  label: string;
  options: Array<Options>;
}

const AddPart: React.FC<AddPartProps> = ({ showModal, setShowModal }) => {
  const [partNo, setPartNo] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [originVin, setOriginVin] = React.useState<string>("");
  const [compatibleCars, setCompatibleCars] = React.useState<Array<String>>([]);
  const [carOptions, setCarOptions] = React.useState<Array<NestedOptions>>([]);
  const [donorOptions, setDonorOptions] = React.useState<Array<Options>>([]);

  const cars = trpc.cars.getAll.useQuery();
  const origins = trpc.origins.getAllWithCars.useQuery();
  const savePart = trpc.parts.createPart.useMutation();
  const savePartCarRelation = trpc.parts.createCarRelation.useMutation();

  useMemo(() => {
    cars.data?.forEach((car: ICar) => {
      setCarOptions((prevState: Array<NestedOptions>) => {
        if (prevState.some((group: NestedOptions) => group.label === car.series)) {
          return prevState.map((group: NestedOptions) => {
            if (group.label === car.series) {
              group.options.push({
                label: `${car.generation} ${car.model}`,
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
                { label: `${car.generation} ${car.model}`, value: car.id },
              ],
            },
          ];
        }
      });
    });
  }, [cars.data]);

  useMemo(() => {
    origins.data?.forEach((origin: IOrigin) => {
      setDonorOptions((prevState: Array<Options>) => {
        return [
          ...prevState,
          {
            label: `${origin.vin} ${origin.year} ${origin.car.generation} ${origin.car.model}`,
            value: origin.vin,
          },
        ];
      });
    });
  }, [origins.data]);

  const onSave = async () => {
    const result = await savePart.mutateAsync({
      partNo: partNo,
      name: name,
      originVin: originVin,
    });
    const partId = result.id
    const carRelations = compatibleCars.map((carId: any) => {
      return {
        partId: partId,
        carId: carId,
      };
    });
    await savePartCarRelation.mutateAsync(carRelations);
    setPartNo("");
    setName("");
    setOriginVin("");
  };

  useEffect(() => {
    console.log(compatibleCars);
  }, [compatibleCars]);

  return (
    <div
      id="defaultModal"
      aria-hidden="true"
      className={`h-modal fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full ${
        showModal ? "" : "hidden"
      }`}
    >
      <ModalBackDrop />
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add a part
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
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Part No.
              </label>
              <input
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Donor Car (Origin)
              </label>
              <Select
                onChange={(e: SingleValue<Options>) => setOriginVin(e?.value as string)}
                options={donorOptions}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Compatible Cars
              </label>
              <Select
                onChange={(e: any) => {
                  setCompatibleCars(e.map((car:Options) => car.value));
                }}
                isMulti
                options={carOptions}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              onClick={onSave as any}
              data-modal-toggle="defaultModal"
              type="button"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save origin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPart;
