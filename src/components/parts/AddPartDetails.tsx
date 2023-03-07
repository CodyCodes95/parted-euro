import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import { useDebounce } from "use-debounce";
import { Car } from "@prisma/client";


interface AddPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  refetch: () => void;
}

interface Options {
  label: string;
  value: string;
}

interface NestedOptions {
  label: string;
  options: Array<Options>;
}

const AddPartDetails: React.FC<AddPartProps> = ({
  showModal,
  setShowModal,
  error,
  success,
  refetch
}) => {
  const [partNo, setPartNo] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [compatibleCars, setCompatibleCars] = useState<Array<string>>([]);
  const [carOptions, setCarOptions] = useState<Array<NestedOptions>>([]);
  const [partTypeIds, setPartTypeIds] = useState<string[] | null>(null);
  const [carSearchInput, setCarSearchInput] = useState<string>("");
  const [debouncedSearch] = useDebounce(carSearchInput, 200);

  const partTypes = trpc.partDetails.getAllPartTypes.useQuery();

  const cars = trpc.cars.getAllSearch.useQuery(
    { search: debouncedSearch },
    {
      enabled: !!debouncedSearch,
      onSuccess: (data) => {
        setCarOptions([]);
        data.forEach((car: Car) => {
          setCarOptions((prevState: Array<NestedOptions>) => {
            if (
              prevState.some((group: NestedOptions) => group.label === car.series)
            ) {
              return prevState.map((group: NestedOptions) => {
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
    }
  )

  const savePartDetail = trpc.parts.createPartDetail.useMutation();

  const onSave = async (exit: boolean) => {
    const result = await savePartDetail.mutateAsync(
      {
        partNo: partNo,
        name: name,
        cars: compatibleCars,
        partTypes: partTypeIds as string[],
      },
      {
        onSuccess: () => {
          success(`Part ${partNo} successfully created`);
          setPartNo("");
          setName("");
          setCompatibleCars([]);
          refetch()
          if (exit) {
            setShowModal(false);
          }
        },
        onError: (err) => {
          error(err.message);
        },
      }
    );
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
      <div className="top relative h-full w-full max-w-2xl md:h-auto">
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
                Part Category
              </label>
              <Select
                onChange={(e: any) => {
                  setPartTypeIds(e.map((partType: Options) => partType.value));
                }}
                isMulti={true}
                options={partTypes.data?.map((partType) => {
                  return {
                    label: partType.name,
                    value: partType.id,
                  };
                })}
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
                  setCompatibleCars(e.map((car: Options) => car.value));
                }}
                isMulti
                onInputChange={(e) => {
                  if (e.length > 1) {
                    setCarSearchInput(e);
                  }
                }}
                closeMenuOnSelect={false}
                options={carOptions}
                className="basic-multi-select"
                classNamePrefix="select"
              />

            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              onClick={() => onSave(true)}
              data-modal-toggle="defaultModal"
              type="button"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save and Exit
            </button>
            <button
              onClick={() => onSave(false)}
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

export default AddPartDetails;
