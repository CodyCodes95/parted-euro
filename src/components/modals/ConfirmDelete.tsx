import { Trash } from "lucide-react";
import Modal from "./Modal";
import { Button } from "../ui/button";

type ConfirmDeleteProps = {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFunction: () => void;
  showModal: boolean;
};

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  setShowModal,
  showModal,
  deleteFunction,
}) => {
  return (
    <Modal width="max-w-xl" isOpen={showModal} setIsOpen={setShowModal} title="Confirm Delete">
      <div className="flex w-full flex-col items-center justify-center p-12">
        <Trash className="h-20 w-20 opacity-20" />
        <p className="mb-4 text-gray-500 dark:text-gray-300">
          Are you sure you want to delete this item?
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button onClick={() => setShowModal(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={deleteFunction} variant="destructive">
            Yes, Im sure
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;
