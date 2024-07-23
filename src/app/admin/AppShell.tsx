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
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save done
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

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

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

export function Command() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const results = trpc.admin.adminSearch.useQuery(debouncedSearch);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
