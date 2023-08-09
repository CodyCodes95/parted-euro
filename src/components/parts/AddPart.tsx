import { useState } from "react";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import type { Car, Donor, InventoryLocations, Part } from "@prisma/client";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { useDebounce } from "use-debounce";
import Modal from "../modals/Modal";

interface AddPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  donorVin?: string;
  success: (message: string) => void;
  error: (message: string) => void;
  part?: Part | null;
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

const AddPart: React.FC<AddPartProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  donorVin,
  part,
  refetch,
}) => {
  const [name, setName] = useState<string>("");
  const [partOptions, setPartOptions] = useState<Array<Options>>([]);
  const [partDetailsId, setPartDetailsId] = useState<string>(part?.partDetailsId || "");
  const [inventoryLocation, setInventoryLocation] = useState<string>(
    part?.inventoryLocationId || ""
  );
  const [donor, setDonor] = useState<string>(part?.donorVin || "");
  const [weight, setWeight] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [addInventoryLocation, setAddInventoryLocation] =
    useState<boolean>(false);
  const [newInventoryLocation, setNewInventoryLocation] = useState<string>("");
  const [variant, setVariant] = useState<string>(part?.variant || "");
  const [addParts, setAddParts] = useState<boolean>(false);
  const [compatibleCars, setCompatibleCars] = useState<Array<string>>([]);
  const [carOptions, setCarOptions] = useState<Array<NestedOptions>>([]);
  const [partTypeIds, setPartTypeIds] = useState<string[] | null>(null);
  const [partNo, setPartNo] = useState<string>("");
  const [alternatePartNos, setAlternatePartNos] = useState("");
  const [carSearchInput, setCarSearchInput] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [debouncedSearch] = useDebounce(carSearchInput, 200);

  const parts = trpc.partDetails.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setPartOptions([]);
      data.forEach((part) => {
        setPartOptions((prevState: Array<Options>) => {
          return [
            ...prevState,
            {
              label: `${part.name} (${part.partNo})`,
              value: part.partNo,
            },
          ];
        });
      });
    },
  });

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
                (group: NestedOptions) => group.label === car.series
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
    }
  );

  const donors = trpc.donors.getAll.useQuery();

  const inventoryLocations = trpc.inventoryLocations.getAll.useQuery();

  const savePart = trpc.parts.createPart.useMutation();

  const savePartDetail = trpc.parts.createPartDetail.useMutation();

  const saveInventoryLocation =
    trpc.inventoryLocations.createInventoryLocation.useMutation();

  const partTypes = trpc.partDetails.getAllPartTypes.useQuery(undefined, {
    enabled: addParts,
  });

  const onSave = async () => {
    if (partDetailsId.length === 0) {
      return error("Please select at least one part");
    }
    const savePartFunc = await savePart.mutateAsync({
      partDetailsId,
      donorVin: donorVin || donor,
      inventoryLocationId: inventoryLocation,
      quantity,
      variant: variant || undefined,
    });
    refetch();
    success(`${partNo} successfully added part to donor ${donorVin || donor}"`);
    setShowModal(false);
  };

  const savePartDetails = async () => {
    const result = await savePartDetail.mutateAsync(
      {
        partNo: partNo,
        name: name,
        cars: compatibleCars.map((car: any) => car.value),
        partTypes: partTypeIds as string[],
        weight: weight,
        partLength: length,
        width: width,
        height: height,
        alternatePartNos: alternatePartNos
      },
      {
        onSuccess: (data) => {
          setAddParts(false);
          setPartDetailsId(data.partNo);
        },
        onError: (err) => {
          error(err.message);
        },
      }
    );
  };

  const createInventoryLocation = async () => {
    if (newInventoryLocation === "") {
      toast.error("Please enter a name for the new inventory location");
      return;
    }
    const res = await saveInventoryLocation.mutateAsync({
      name: newInventoryLocation,
    });
    setInventoryLocation(res.id);
    setAddInventoryLocation(false);
  };

  return (
    <Modal isOpen={showModal} setIsOpen={setShowModal} title="Add Part">
      <div className="space-y-6 p-6">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Donor Car (Donor)
          </label>
          <Select
            placeholder={donorVin || "Select a donor"}
            isDisabled={donorVin ? true : false}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(e: any) => setDonor(e.value as string)}
            options={donors.data?.map((donor: Donor) => {
              return {
                label: donor.vin,
                value: donor.vin,
              };
            })}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Variant (Optional)
          </label>
          <input
            className="w-[90%] border-2 p-2"
            type="text"
            placeholder="Variant "
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Quantity
          </label>
          <input
            className="w-[90%] border-2 p-2"
            type="text"
            placeholder="Variant "
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Inventory Location
          </label>
          <div className="flex w-full justify-between">
            {addInventoryLocation ? (
              <>
                <input
                  className="w-[90%] p-2"
                  type="text"
                  placeholder="Inventory Location"
                  value={newInventoryLocation}
                  onChange={(e) => setNewInventoryLocation(e.target.value)}
                />
                <div className="p-2"></div>
                <button
                  onClick={createInventoryLocation}
                  className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <Select
                  defaultValue={
                    inventoryLocation
                      ? {
                          label: newInventoryLocation,
                          value: inventoryLocation,
                        }
                      : "Select an inventory location"
                  }
                  className="basic-multi-select w-[90%]"
                  classNamePrefix="select"
                  onChange={(e: any) => setInventoryLocation(e.value as string)}
                  options={inventoryLocations.data?.map(
                    (location: InventoryLocations) => {
                      return {
                        label: location.name,
                        value: location.id,
                      };
                    }
                  )}
                />
                <button
                  onClick={() => setAddInventoryLocation(true)}
                  className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  +
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Parts
          </label>
          <div className="flex w-full justify-between">
            {addParts ? (
              <div className="w-full">
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
                    value={weight || undefined}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Length
                  </label>
                  <input
                    value={length || undefined}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Width
                  </label>
                  <input
                    value={width || undefined}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Height
                  </label>
                  <input
                    value={height || undefined}
                    onChange={(e) => setHeight(Number(e.target.value))}
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
                      setPartTypeIds(
                        e.map((partType: Options) => partType.value)
                      );
                    }}
                    isMulti={true}
                    options={partTypes.data?.map((partType) => {
                      return {
                        label: `${partType.name} - ${partType.parent?.name || ""}`,
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
                  <div className="flex justify-between">
                    <Select
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
                      options={carOptions}
                      className="basic-multi-select w-full"
                      classNamePrefix="select"
                      value={compatibleCars as any}
                    />
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
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Select
                  placeholder="Select a part"
                  options={partOptions}
                  defaultValue={
                    partDetailsId ? { value: partDetailsId, label: name } : ""
                  }
                  className="w-[90%]"
                  onChange={(e: any) => setPartDetailsId(e.value)}
                />
                <Button onClick={() => setAddParts(true)}>+</Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
        {addParts ? (
          <Button onClick={savePartDetails}>Save Part Details</Button>
        ) : (
          <Button onClick={onSave}>Save</Button>
        )}
      </div>
    </Modal>
  );
};

export default AddPart;
