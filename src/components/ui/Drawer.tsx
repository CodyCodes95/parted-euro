"use client";

import { Drawer as VaulDrawer } from "vaul";
import { useIsMobile } from "../../hooks/isMobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
};

export function Drawer({
  open,
  children,
  trigger,
  onClose,
  onOpenChange,
  title,
}: DrawerProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog onOpenChange={onOpenChange} open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{children}</DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <VaulDrawer.Root onClose={onClose} open={open}>
      {trigger && <VaulDrawer.Trigger>{trigger}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <VaulDrawer.Content
          className={
            "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-white"
          }
        >
          <div className="flex-1 rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
            <div className="w-full">{children}</div>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
