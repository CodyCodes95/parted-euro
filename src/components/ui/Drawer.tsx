"use client";

import { Drawer as VaulDrawer } from "vaul";

type DrawerProps = {
    open: boolean;
};

export function Drawer({open}:DrawerProps) {
  return (
    <VaulDrawer.Root open={open}>
      <VaulDrawer.Trigger asChild>
        <button>Select your car</button>
      </VaulDrawer.Trigger>
        <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
          <VaulDrawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] h-[30%] mt-24 fixed bottom-0 left-0 right-0">
            <div className="p-4 bg-white rounded-t-[10px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
              <div className="max-w-md mx-auto">
                <VaulDrawer.Title className="font-medium mb-4">
                  Select your car
                </VaulDrawer.Title>
              <p>Car selections</p>
              </div>
            </div>
          </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
