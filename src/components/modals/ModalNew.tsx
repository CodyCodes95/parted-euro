import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { type FC } from "react";
import { cn } from "../../lib/utils";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  title: string;
  renderStatic?: boolean;
};

const ModalNew = ({
  isOpen,
  children,
  onClose,
  className,
  title,
  renderStatic,
}: ModalProps) => {
  const widthClasses = className?.includes("w-")
    ? `${className
        .split(" ")
        .filter((c) => c?.includes("w-"))
        .join(" ")}`
    : "w-1/2";

  return (
    <Dialog
      open={isOpen}
      onClose={renderStatic ? () => null : onClose}
      // ^^ infering the open state from whatever type the selected is (pattern I like, is this right?)
      className="relative z-20"
      static={renderStatic}
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        {/* The actual dialog panel  */}
        <div
          className={`flex items-center justify-between rounded-t-lg border-b-2 bg-white p-2 ${widthClasses}  
      }`}
        >
          <Dialog.Title className="text-xl font-medium">{title}</Dialog.Title>
          <X
            className="h-10 w-10 cursor-pointer rounded-md p-2 hover:bg-gray-200"
            onClick={onClose}
          />
        </div>
        <Dialog.Panel
          id="modal-panel"
          className={cn(
            `mx-auto overflow-y-auto rounded-b-md bg-white shadow-2xl ${widthClasses}`,
            className
          )}
        >
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModalNew;
