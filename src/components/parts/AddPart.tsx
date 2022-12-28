import React, { useEffect } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import FormSection from "../FormSection";
import Select from "react-select";

interface AddPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// const options = [
//   {
//     label: "Group 1",
//     options: [
//       { label: "Group 1, option 1", value: "value_1" },
//       { label: "Group 1, option 2", value: "value_2" },
//     ],
//   },
//   { label: "A root option", value: "value_3" },
//   { label: "Another root option", value: "value_4" },
// ];

const thing = [
  {
    id: "clc4g27p00000mzbctsx8nvld",
    make: "BMW",
    series: "3 Series",
    generation: "E46",
    model: "M3",
  },
];

interface ICar {
  id: string;
  make: string;
  series: string;
  generation: string;
  model: string;
}

const AddPart: React.FC<AddPartProps> = ({ showModal, setShowModal }) => {
  const [partNo, setPartNo] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [originVin, setOriginVin] = React.useState<string>("");
  const [compatibleCars, setCompatibleCars] = React.useState<string>("");
  const [options, setOptions] = React.useState<any>([]);
  const [cars, setCars] = React.useState<ICar[]>([]);

  const getAllCars = trpc.cars.getAll.useQuery();
  const savePart = trpc.parts.createPart.useMutation();


  useEffect(() => {
    const { data: cars } = getAllCars;
  }, []);

  useEffect(() => {
    const temp = {} as any;
    const tempOptions = cars?.map((car: ICar) => {
      if (!temp[car.generation]) {
        temp[car.generation] = car.generation;
        return {
          label: `${car.generation}`,
          options: [
            {
              label: `${car.model}`,
              value: car.id,
            },
          ],
        };
      }
      // temp[car.generation] = car.generation
      // return {
      //   label: `${car.make} ${car.series} ${car.generation} ${car.model}`,
      //   value: car.id
      // }
    });
    setOptions(tempOptions);
  }, [cars]);

  const onSave = async () => {
    const result = await savePart.mutateAsync({
      partNo: partNo,
      name: name,
      originVin: originVin,
    });
    setPartNo("");
    setName("");
    setOriginVin("");
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
                type="number"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Origin
              </label>
              <input
                type="text"
                value={originVin}
                onChange={(e) => setOriginVin(e.target.value)}
                className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Compatible Cars
              </label>
              <Select
                // defaultValue={"Select"}
                isMulti
                options={options}
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
