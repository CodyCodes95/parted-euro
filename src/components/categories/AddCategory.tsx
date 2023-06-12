import { useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import type { PartTypeParentCategory, PartTypes } from "@prisma/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AddCategoryProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  refetch: () => void;
  selection:
    | PartTypeParentCategory 
    | (PartTypes & { parentCategory: PartTypeParentCategory })
    | undefined;
}

const AddCategory: React.FC<AddCategoryProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  refetch,
  selection,
}) => {
  const [name, setName] = useState<string>(selection?.name || "");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");

  const parentCategories = trpc.categories.getAllCategories.useQuery();
  const saveCategory = trpc.categories.createSubCategory.useMutation();
  const updateCateogry = trpc.categories.editSubCategory.useMutation();

  const onSave = async () => {
    if (!parentCategoryId) {
      return error("Please select a parent category");
    }
    if (!name) {
      return error("Please enter a name for the category");
    }
    await saveCategory.mutateAsync({
      name,
      parentCategoryId,
    });
    success(`${name} Category created`);
    refetch();
    setName("");
    setShowModal(false);
  };

  const onUpdate = async () => {
    await updateCateogry.mutateAsync({
      id: selection?.id as string,
      name,
    });
    success(`${name} Category updated`);
    refetch();
    setName("");
    setShowModal(false);
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
              Add a category
            </h3>
            <button
              onClick={() => setShowModal(!showModal)}
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
                Category Name
              </label>
              <input
                className="w-[90%] border-2 p-2"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {!selection && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Parent Category
                </label>
                <Select
                  placeholder={"Select a donor"}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={(e:any) => setParentCategoryId(e.value)}
                  options={parentCategories.data?.map(
                    (category: PartTypeParentCategory) => {
                      return {
                        label: category.name,
                        value: category.id,
                      };
                    }
                  )}
                />
              </div>
            )}
            <button
              onClick={async () => {
                if (selection) {
                  await onUpdate();
                } else {
                   await onSave();
                }
              }}
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

export default AddCategory;
