import { Fragment } from "react";
import { signOut } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PopoverClose } from "@radix-ui/react-popover";

const AdminMenu = () => {

  return (
    <Popover >
      <PopoverTrigger  asChild>
        <button className="flex items-center">
        <User className="text-2xl" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-24 p-0">
        <PopoverClose asChild>
                    <Link
                    href="/admin"
                    className={`
                     group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-[#d03b36] hover:text-white`}
                  >
                    Admin
                  </Link>
        </PopoverClose>
        <PopoverClose asChild>
              <button
                    onClick={() => signOut()}
                    className={`
                     group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-[#d03b36] hover:text-white`}
                  >
                    Logout
                  </button>
                  </PopoverClose>
      </PopoverContent>
    </Popover>
  );
};

export default AdminMenu;


