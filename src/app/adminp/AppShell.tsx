"use client";
import useIsCollapsed from "@/hooks/use-is-collapsed";
import { useEffect, useState } from "react";
import { Button, Layout, Sidebar } from "./sidebar";
import ThemeSwitch from "@/components/admin/theme-switch";
import { UserNav } from "@/components/admin/user-nav";
import { create } from "zustand";

type AdminStore = {
  selectedListing: QueryListingsGetAllAdmin | null;
  setSelectedListing: (listing: QueryListingsGetAllAdmin | null) => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  selectedListing: null,
  setSelectedListing: (listing) => set({ selectedListing: listing }),
}));

const AppShell = ({ children }: React.PropsWithChildren) => {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed();
  const { selectedListing, setSelectedListing } = useAdminStore();
  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${
          isCollapsed ? "md:ml-14" : "md:ml-64"
        } h-full`}
      >
        <Layout fixed>
          {/* ===== Top Heading ===== */}
          <Layout.Header>
            <div className="flex w-full items-center justify-between">
              <Command />
              <div className="flex items-center space-x-4">
                <ThemeSwitch />
                <UserNav />
              </div>
            </div>
          </Layout.Header>

          {/* ===== Content ===== */}
          <Layout.Body className="flex flex-col">{children}</Layout.Body>
        </Layout>
      </main>
      {selectedListing && (
        <Dialog
          open={!!selectedListing}
          onOpenChange={(open) => setSelectedListing(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedListing.id ? "Edit car" : "New car"}
              </DialogTitle>
              <DialogDescription>
                Make changes to your car here. Click save done
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Pedro Duarte"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue="@peduarte"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppShell;

import { Loader2, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import type { AdminSearchCounts } from "@/utils/trpc";
import { trpc, type QueryListingsGetAllAdmin } from "@/utils/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDebounce } from "use-debounce";
import EditCar from "./listings/components/EditCar";
import {
  IconCar,
  IconCarCrash,
  IconCategory,
  IconInvoice,
  IconList,
  IconPackage,
  IconSettings,
  IconShoppingBag,
  IconShoppingBagEdit,
  IconTool,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type AdminSearchStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  shouldFilter: boolean;
  setShouldFilter: (shouldFilter: boolean) => void;
};

export const useAdminSearchStore = create<AdminSearchStore>((set) => ({
  shouldFilter: true,
  open: false,
  setOpen: (open) => set({ open }),
  setShouldFilter: (shouldFilter) => set({ shouldFilter }),
}));

export function Command() {
  const [commandPage, setCommandPage] = useState("home");
  const { shouldFilter, open, setOpen } = useAdminSearchStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex w-52 justify-between"
        >
          Search...
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <CommandDialog
        shouldFilter={shouldFilter}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setCommandPage("home");
        }}
      >
        {commandPage === "home" && (
          <CommandHome setCommandPage={setCommandPage} />
        )}
        {commandPage === "search" && (
          <CommandGlobalSearch setCommandPage={setCommandPage} />
        )}
      </CommandDialog>
    </>
  );
}

type CommandPageProps = {
  setCommandPage: (page: string) => void;
};

const CommandGlobalSearch = ({ setCommandPage }: CommandPageProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [resultsPage, setResultsPage] = useState("counts");
  const { setShouldFilter } = useAdminSearchStore();
  const counts = trpc.admin.adminSearchCounts.useQuery(debouncedSearch);

  // TODO: remove
  useEffect(() => {
    if (!counts.data) return;
    setShouldFilter(false);
  }, [counts.data]);

  return (
    <>
      <CommandInput
        autoFocus
        value={search}
        onValueChange={(val) => setSearch(val)}
        placeholder="Type a command or search..."
      />
      <CommandList>
        {resultsPage === "counts" && (
          <>
            <CommandEmpty>
              {!search ? "Search for anything" : "No results found"}
            </CommandEmpty>
            <CommandGroup heading="Results">
              <CommandItem onSelect={() => setResultsPage("listings")}>
                <IconList size={18} />
                <span>Listings</span>
                {counts.isLoading ? (
                  <Loader2 className="ml-auto animate-spin text-white" />
                ) : (
                  <Badge className="ml-auto">
                    {counts.data?.listings ?? 0}
                  </Badge>
                )}
              </CommandItem>
              <CommandItem onSelect={() => setResultsPage("inventory")}>
                <IconPackage size={18} />
                <span>Inventory</span>
                {counts.isLoading ? (
                  <Loader2 className="ml-auto animate-spin text-white" />
                ) : (
                  <Badge className="ml-auto">
                    {counts.data?.inventory ?? 0}
                  </Badge>
                )}
              </CommandItem>
              <CommandItem onSelect={() => setResultsPage("cars")}>
                <IconCar size={18} />
                <span>Cars</span>
                {counts.isLoading ? (
                  <Loader2 className="ml-auto animate-spin text-white" />
                ) : (
                  <Badge className="ml-auto">{counts.data?.cars ?? 0}</Badge>
                )}
              </CommandItem>
            </CommandGroup>
          </>
        )}
        {resultsPage === "listings" && (
          <CommandListingResults search={debouncedSearch} />
        )}
        {resultsPage === "inventory" && (
          <CommandInventoryResults search={debouncedSearch} />
        )}
        {resultsPage === "cars" && (
          <CommandCarsResults search={debouncedSearch} />
        )}
      </CommandList>
    </>
  );
};

const CommandInventoryResults = ({ search }: { search: string }) => {
  const { data: listings, isLoading } =
    trpc.admin.adminSearchListings.useQuery(search);
  return (
    <>
      <CommandEmpty>
        {!search ? (
          "Search for anything"
        ) : isLoading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          "No results found"
        )}
      </CommandEmpty>
      {!!listings?.length && (
        <CommandGroup heading="Listings">
          {listings?.map((listing) => {
            return (
              // on select - go to listings page with table filtered?
              // Or just open up edit modal right here?
              <CommandItem
                key={listing.id}
                onSelect={() => console.log(listing)}
              >
                <IconList size={18} />
                <span>{listing.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </>
  );
};

const CommandCarsResults = ({ search }: { search: string }) => {
  const { data: cars, isLoading } = trpc.admin.adminSearchCars.useQuery(search);
  return (
    <>
      <CommandEmpty>
        {!search ? (
          "Search for anything"
        ) : isLoading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          "No results found"
        )}
      </CommandEmpty>
      {!!cars?.length && (
        <CommandGroup heading="Cars">
          {cars?.map((car) => {
            return (
              // on select - go to listings page with table filtered?
              // Or just open up edit modal right here?
              <CommandItem key={car.id} onSelect={() => console.log(car)}>
                <IconCar size={18} />
                <span>{car.make}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </>
  );
};

const CommandListingResults = ({ search }: { search: string }) => {
  const { data: listings, isLoading } =
    trpc.admin.adminSearchListings.useQuery(search);
  return (
    <>
      <CommandEmpty>
        {!search ? (
          "Search for anything"
        ) : isLoading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          "No results found"
        )}
      </CommandEmpty>
      {!!listings?.length && (
        <CommandGroup heading="Listings">
          {listings?.map((listing) => {
            return (
              // on select - go to listings page with table filtered?
              // Or just open up edit modal right here?
              <CommandItem key={listing.id}>
                <IconList size={18} />
                <span>{listing.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </>
  );
};

const CommandHome = ({ setCommandPage }: CommandPageProps) => {
  const authenticateXero = trpc.xero.authenticate.useMutation();
  const authenticateEbay = trpc.ebay.authenticate.useMutation();

  const onAuthenticateXero = async () => {
    const url = await authenticateXero.mutateAsync();
    if (!url) throw new Error("Xero authentication failed");
    window.open(url, "_blank");
  };

  const onAuthenticateEbay = async () => {
    const url = await authenticateEbay.mutateAsync();
    if (!url) throw new Error("Ebay authentication failed");
    window.open(url, "_blank");
  };

  return (
    <>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Commands">
          <CommandItem onSelect={() => setCommandPage("search")}>
            <Search size={18} />
            <span>Global search</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Pages">
          <CommandItemLink href={"/admin/data/cars"}>
            <IconCar size={18} />
            <span>Cars</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/data/parts">
            <IconTool size={18} />
            <span>Parts</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/data/categories">
            <IconCategory size={18} />
            <span>Categories</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/donors">
            <IconCarCrash size={18} />
            <span>Donors</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/inventory">
            <IconPackage size={18} />
            <span>Inventory</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/listings">
            <IconList size={18} />
            <span>Listings</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/orders">
            <IconShoppingBag size={18} />
            <span>Orders</span>
          </CommandItemLink>
          <CommandItemLink href="/admin/settings">
            <IconSettings size={18} />
            <span>Settings</span>
          </CommandItemLink>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={onAuthenticateXero}>
            <IconInvoice size={18} />
            <span>Refresh Xero</span>
            {/* <CommandShortcut>⌘P</CommandShortcut> */}
          </CommandItem>
          <CommandItem onSelect={onAuthenticateEbay}>
            <IconShoppingBagEdit size={18} />
            <span>Refresh eBay</span>
            {/* <CommandShortcut>⌘B</CommandShortcut> */}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
};

type CommandItemLinkProps = {
  href: string;
  children: React.ReactNode;
};

const CommandItemLink = ({ href, children }: CommandItemLinkProps) => {
  const router = useRouter();

  return (
    <CommandItem onSelect={() => router.push(href)}>{children}</CommandItem>
  );
};
