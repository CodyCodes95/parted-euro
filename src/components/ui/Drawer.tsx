"use client";

import { useState } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { trpc } from "../../utils/trpc";

type DrawerProps = {
  open: boolean;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
};

export function Drawer({ open, children, trigger }: DrawerProps) {
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
    <VaulDrawer.Root open={open}>
      {trigger && <VaulDrawer.Trigger>{trigger}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
        <VaulDrawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[40%] flex-col rounded-t-[10px] bg-zinc-100">
          <div className="flex-1 rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
            <div className="mx-auto max-w-md">{children}</div>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
