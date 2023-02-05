import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select, { MultiValue, SingleValue } from "react-select";
import { Donor, InventoryLocations } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AddPartProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  donorVin?: string;
  success: (message: string) => void;
  error: (message: string) => void;
}

interface Options {
  label: string;
  value: string;
}

const AddPart: React.FC<AddPartProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  donorVin,
}) => {
  const [name, setName] = useState<string>("");
  const [partOptions, setPartOptions] = useState<Array<Options>>([]);
  const [partDetailsIds, setPartDetailsIds] = useState<Array<string>>([]);
  const [inventoryLocation, setInventoryLocation] = useState<string>("");
  const [donor, setDonor] = useState<string>(donorVin || "");
  const [addInventoryLocation, setAddInventoryLocation] =
    useState<boolean>(false);
  const [newInventoryLocation, setNewInventoryLocation] = useState<string>("");
  const [variant, setVariant] = useState<string>("");

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

  const donors = trpc.donors.getAll.useQuery();

  const inventoryLocations = trpc.inventoryLocations.getAll.useQuery();

  const savePart = trpc.parts.createPart.useMutation();

  const saveInventoryLocation =
    trpc.inventoryLocations.createInventoryLocation.useMutation();

  const onSave = async () => {
    if (partDetailsIds.length === 0) {
      return error("Please select at least one part");
    }
    const savePartPromises = partDetailsIds.map((id) => {
      return savePart.mutateAsync({
        partDetailsId: id,
        donorVin: donorVin || donor,
        inventoryLocationId: inventoryLocation,
        variant: variant || undefined,
      });
    });
    await Promise.all(savePartPromises);
    setShowModal(false);
    success(
      `${savePartPromises.length} parts successfully added to donor ${donorVin}"`
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
    setNewInventoryLocation("");
    setAddInventoryLocation(false);
  };

  return (
    <div
      id="defaultModal"
      aria-hidden="true"
      className={`h-modal fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full ${
        showModal ? "" : "hidden"
      }`}
    >
      <ToastContainer />
      <ModalBackDrop setShowModal={setShowModal} />
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
                      placeholder={
                        inventoryLocation || "Select an inventory location"
                      }
                      className="basic-multi-select w-[90%]"
                      classNamePrefix="select"
                      onChange={(e: any) =>
                        setInventoryLocation(e.value as string)
                      }
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
              <Select
                isMulti={true}
                placeholder="Select one or more parts"
                options={partOptions}
                closeMenuOnSelect={false}
                onChange={(e: any) =>
                  setPartDetailsIds(e.map((part: Options) => part.value))
                }
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              onClick={onSave}
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

export default AddPart;
