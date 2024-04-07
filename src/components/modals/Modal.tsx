import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { type FC } from "react";
import { cn } from "../../lib/utils";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  children: React.ReactNode;
  callback?: () => void;
  width?: string;
};

const Modal: FC<ModalProps> = ({
  isOpen,
  setIsOpen,
  title,
  children,
  callback,
  width = "w-1/2",
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (callback) {
          callback();
        }
        setIsOpen(false);
      }}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* The actual dialog panel  */}
        {/* <Dialog.Panel className="mx-auto w-1/2 rounded-lg bg-white p-2 max-h-[45rem] overflow-y-scroll"> */}
        <Dialog.Panel
          className={cn(
            "mx-auto max-h-[45rem] overflow-y-scroll rounded-lg bg-white p-2",
            width,
          )}
        >
          <div className="flex w-full items-center justify-between rounded-t-lg border-b-2 p-2">
            <Dialog.Title className="text-xl font-medium">{title}</Dialog.Title>
            <X
              className="h-10 w-10 cursor-pointer rounded-md p-2 hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            />
          </div>
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default Modal;
