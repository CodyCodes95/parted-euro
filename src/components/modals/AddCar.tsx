import React, { useEffect } from "react";
import { trpc } from "../../utils/trpc";
import AddCarFormSection from "./AddCarFormSection";
import ModalBackDrop from "./ModalBackdrop";

interface AddCarProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCar: React.FC<AddCarProps> = ({ showModal, setShowModal }) => {
  const [make, setMake] = React.useState<string>("BMW");
  const [series, setSeries] = React.useState<string>("");
  const [generation, setGeneration] = React.useState<string>("");
  const [model, setModel] = React.useState<string>("");
  const cars = trpc.cars.getAll.useQuery();
  console.log(cars);

  const saveCar = trpc.cars.createCar.useMutation();

  const onSave = async () => {
    const result = await saveCar.mutateAsync({
      make: make,
      series: series,
      generation: generation,
      model: model,
    });
    console.log(result);
    setSeries("");
    setGeneration("");
    setModel("");
  };

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
              Add a car
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
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-6 p-6">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Make
              </label>
              <select
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                disabled={true}
              >
                <option value="BMW">BMW</option>
              </select>
            </div>
            <AddCarFormSection
              title="Series"
              data={[...new Set(cars.data?.map((car) => car.series))]}
              value={series}
              setValue={setSeries}
            />
            <AddCarFormSection
              title="Generation"
              data={[...new Set(cars.data?.map((car) => car.generation))]}
              value={generation}
              setValue={setGeneration}
            />
            <AddCarFormSection
              title="Model"
              data={[...new Set(cars.data?.map((car) => car.model))]}
              value={model}
              setValue={setModel}
            />
          </div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              onClick={onSave as any}
              data-modal-toggle="defaultModal"
              type="button"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save car
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
