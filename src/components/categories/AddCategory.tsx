import { useState } from "react";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import type { PartTypes } from "@prisma/client";
import Modal from "../modals/Modal";

interface AddCategoryProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  refetch: () => void;
  selection: PartTypes | undefined;
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

  const parentCategories = trpc.categories.getParentCategories.useQuery();
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
    <Modal
      isOpen={showModal}
      setIsOpen={setShowModal}
      title={selection ? "Edit Category" : "Add Category"}
    >
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
              onChange={(e: any) => setParentCategoryId(e.value)}
              options={parentCategories.data?.map((category: PartTypes) => {
                return {
                  label: category.name,
                  value: category.id,
                };
              })}
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
    </Modal>
  );
};

export default AddCategory;
