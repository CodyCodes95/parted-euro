import { trpc } from "../../utils/trpc";
import Select from "react-select";
import type { Car, Part, PartDetail } from "@prisma/client";
import { useState } from "react";
import Modal from "../modals/Modal";
import { toast } from "sonner";

interface EditPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: () => void;
  selection: PartDetail & {
    partTypes: any;
    parts: Part[];
    cars: Car[];
  };
}

interface Options {
  label: string;
  value: string;
}

interface NestedOptions {
  label: string;
  options: Array<Options>;
}

const EditPartDetails: React.FC<EditPartProps> = ({
  showModal,
  setShowModal,
  selection,
  refetch,
}) => {
  const [partNo, setPartNo] = useState<string>(selection.partNo);
  const [alternatePartNos, setAlternatePartNos] = useState(
    selection.alternatePartNumbers || "",
  );
  const [name, setName] = useState<string>(selection.name);
  const [weight, setWeight] = useState<string>(selection.weight.toString());
  const [length, setLength] = useState<string>(selection.length.toString());
  const [width, setWidth] = useState<string>(selection.width.toString());
  const [height, setHeight] = useState<string>(selection.height.toString());
  const [compatibleCars, setCompatibleCars] = useState<Array<string>>(
    selection.cars.map((car: any) => car.id),
  );
  const [carOptions, setCarOptions] = useState<Array<NestedOptions>>([]);
  const [partTypeIds, setPartTypeIds] = useState<Array<string>>(
    selection.partTypes.map((category: any) => category.id),
  );

  const partTypes = trpc.partDetails.getAllPartTypes.useQuery();

  const cars = trpc.cars.getAll.useQuery(undefined, {
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
  });
  const updatePartDetail = trpc.parts.updatePartDetail.useMutation();

  const onSave = async (exit: boolean) => {
    const result = await updatePartDetail.mutateAsync(
      {
        partNo: partNo,
        name: name,
        cars: compatibleCars,
        weight: Number(weight),
        partLength: Number(length),
        width: Number(width),
        height: Number(height),
        partTypes: partTypeIds,
        alternatePartNos: alternatePartNos,
      },
      {
        onSuccess: () => {
          toast.success(`Part ${partNo} successfully updated`);
          setPartNo("");
          setName("");
          setAlternatePartNos("");
          setCompatibleCars([]);
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
    <Modal
      isOpen={showModal}
      setIsOpen={setShowModal}
      title="Edit Part Details"
    >
      <div className="space-y-6 overflow-auto p-6">
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
            type="numberic"
            onChange={(e) => setWeight(e.target.value)}
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
            Part Category
          </label>
          {partTypes.data?.length ? (
            <Select
              isMulti={true}
              onChange={(e: any) => {
                setPartTypeIds(e.map((partType: Options) => partType.value));
              }}
              defaultValue={selection.partTypes.map((partType: any) => {
                return {
                  label: `${partType.name} - ${
                    partTypes.data?.find((type) => type.name === partType.name)
                      ?.parent?.name || ""
                  }`,
                  value: partType.id,
                };
              })}
              options={partTypes.data?.map((partType) => {
                return {
                  label: `${partType.name} - ${partType.parent?.name || ""}`,
                  value: partType.id,
                };
              })}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          ) : null}
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Compatible Cars
          </label>
          <Select
            onChange={(e: any) => {
              setCompatibleCars(e.map((car: Options) => car.value));
            }}
            value={carOptions.reduce(
              (options: any, group: any) => [
                ...options,
                ...group.options.filter((option: any) =>
                  compatibleCars.includes(option.value),
                ),
              ],
              [],
            )}
            isMulti
            closeMenuOnSelect={false}
            options={carOptions.map((group) => {
              return {
                label: group.label,
                options: group.options.sort((a, b) =>
                  a.label.localeCompare(b.label),
                ),
              };
            })}
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
    </Modal>
  );
};

export default EditPartDetails;
