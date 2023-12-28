"use client";

import { useState } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { trpc } from "../../utils/trpc";
import { cn } from "../../lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  height?: string;
};

export function Drawer({
  open,
  children,
  trigger,
  height,
  onClose,
}: DrawerProps) {
  const [series, setSeries] = useState<string>("");
  const [generation, setGeneration] = useState<string>("");
  const [model, setModel] = useState<string>("");

  const cars = trpc.cars.getAllSeries.useQuery(undefined, {});

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series },
    {
      enabled: series !== "",
    },
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation },
    {
      enabled: generation !== "",
    },
  );

  return (
    <VaulDrawer.Root onClose={onClose} open={open}>
      {trigger && <VaulDrawer.Trigger>{trigger}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <VaulDrawer.Content
          className={cn(
            "md:h-[35%]) fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[40%] flex-col rounded-t-[10px] bg-zinc-100",
            height,
          )}
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
