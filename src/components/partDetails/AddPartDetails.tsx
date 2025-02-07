import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import { useDebounce } from "use-debounce";
import type { Car } from "@prisma/client";
import { Button } from "../ui/button";
import Modal from "../modals/Modal";
import { toast } from "sonner";
import { useRouter } from "next/router";

type AddPartProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: () => void;
};

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
  refetch,
}) => {
  const [partNo, setPartNo] = useState<string>("");
  const [alternatePartNos, setAlternatePartNos] = useState("");
  const [name, setName] = useState<string>("");
  const [compatibleCars, setCompatibleCars] = useState<Array<string>>([]);
  const [carOptions, setCarOptions] = useState<Array<NestedOptions>>([]);
  const [partTypeIds, setPartTypeIds] = useState<string[] | null>(null);
  const [carSearchInput, setCarSearchInput] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [debouncedSearch] = useDebounce(carSearchInput, 200);

  const router = useRouter();

  const partTypes = trpc.partDetails.getAllPartTypes.useQuery();

  useEffect(() => {
    console.log(carOptions);
  }, [carOptions]);

  const cars = trpc.cars.getAllSearch.useQuery(
    { search: debouncedSearch },
    {
      enabled: !!debouncedSearch,
      onSuccess: (data) => {
        setCarOptions([]);
        data.forEach((car: Car) => {
          setCarOptions((prevState: Array<NestedOptions>) => {
            if (
              prevState.some(
                (group: NestedOptions) => group.label === car.series,
              )
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
    },
  );

  const savePartDetail = trpc.parts.createPartDetail.useMutation();

  const onSave = async (exit: boolean) => {
    const result = await savePartDetail.mutateAsync(
      {
        partNo: partNo,
        name: name,
        cars: compatibleCars.map((car: any) => car.value),
        weight: Number(weight),
        partLength: Number(length),
        width: Number(width),
        height: Number(height),
        costPrice: Number(costPrice),
        partTypes: partTypeIds!,
        alternatePartNos: alternatePartNos,
      },
      {
        onSuccess: () => {
          toast.success(`Part ${partNo} successfully created`, {
            duration: Infinity,
            cancel: {
              label: "Cancel",
            },
            action: {
              label: "Add inventory",
              onClick: () => {
                void router.push(
                  `/admin/inventory?showModal=true&selectedParts=${partNo}`,
                );
              },
            },
          });
          setPartNo("");
          setName("");
          setCompatibleCars([]);
          setWeight("");
          setLength("");
          setWidth("");
          setHeight("");
          setCostPrice("");
          setPartTypeIds([]);
          refetch();
          if (exit) {
            setShowModal(false);
          }
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <Modal isOpen={showModal} setIsOpen={setShowModal} title="Add Part Details">
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
            Alternate Part Numbers
          </label>
          <input
            value={alternatePartNos}
            onChange={(e) => setAlternatePartNos(e.target.value)}
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Weight
          </label>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="numeric"
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Length
          </label>
          <input
            value={length}
            onChange={(e) => setLength(e.target.value)}
            type="numeric"
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Width
          </label>
          <input
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            type="numeric"
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Height
          </label>
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            type="numeric"
            className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Cost Price
          </label>
          <input
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            type="numeric"
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
                label: `${partType.name} - ${partType.parent?.name || ""}`,
                value: partType.id,
              };
            })}
            className="basic-multi-select h-11"
            classNamePrefix="select"
          />
        </div>
        <div className="mb-6 flex flex-col gap-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Compatible Cars
          </label>
          {!!carOptions.length && (
            <Button
              onClick={() =>
                setCompatibleCars([
                  ...compatibleCars,
                  ...carOptions.reduce((acc: any, car: any) => {
                    if (!compatibleCars.includes(car.label)) {
                      if (acc.find((c: any) => c.label === car.label)) {
                        return acc;
                      }
                      return [...acc, ...car.options];
                    }
                    return acc;
                  }, [] as Options[]),
                ])
              }
            >
              Select All
            </Button>
          )}
          <Select
            styles={{
              valueContainer: (provided) => ({
                ...provided,
                maxHeight: "100px",
                overflow: "auto",
              }),
            }}
            onChange={(e: any) => {
              setCompatibleCars(e.map((car: Options) => car));
            }}
            isMulti
            onInputChange={(e) => {
              if (e.length > 1) {
                setCarSearchInput(e);
              }
            }}
            closeMenuOnSelect={false}
            options={carOptions.map((group) => {
              return {
                label: group.label,
                options: group.options.sort((a, b) =>
                  a.label.localeCompare(b.label),
                ),
              };
            })}
            className="basic-multi-select w-full"
            classNamePrefix="select"
            value={compatibleCars as any}
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
    </Modal>
  );
};

export default AddPartDetails;
