"use client";

import * as React from "react";
import Link from "next/link";
import logo from "../../public/logo.png";
import { cn } from "../lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { useSession, signIn } from "next-auth/react";
import { Menu, Transition } from '@headlessui/react'
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import CartPopover from "./Nav/CartPopover";
import AdminMenu from "./Nav/AdminMenu";
import SearchBar from "./Nav/SearchBar";
import {BsFillPersonFill} from "react-icons/bs";
import {FiLogIn} from "react-icons/fi";
import CartContext from "../context/cartContext";
import { FaShoppingCart, FaSearch } from "react-icons/fa";



const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

const NavNew = () => {
  const { cart, setCart } = React.useContext(CartContext);
  const [showLogin, setShowLogin] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [openAdminMenu, setOpenAdminMenu] = React.useState<boolean>(false);

  const adminRef = React.useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  return (
    <div className="flex h-16 w-full items-center justify-between border-b-2 bg-white px-16 py-8">
      <button
        onClick={() => {
          if (session) return;
          setShowLogin(!showLogin);
        }}
        className="absolute left-0 cursor-default text-white"
      >
        G
      </button>
      <Link href="/">
        <img className="mr-6 inline h-8" src={logo.src} alt="" />
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Shop By Generation</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      {/* <Icons.logo className="h-6 w-6" /> */}
                      <div className="mb-2 mt-4 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/primitives/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <Link href="/wrecking" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Cars Wrecking Now
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/returns-refunds" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Warrenty & Return Policy
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Contact
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center">
        <div
          onClick={() => setShowSearch(!showSearch)}
          className="cursor-pointer p-2"
        >
          <FaSearch className="text-xl" />
        </div>
        <div className="relative">
          {cart.length ? (
            <Badge
              className="absolute top-[-1.5rem] left-3 text-xs"
              variant={"destructive"}
            >
              {cart.length}
            </Badge>
          ) : null}
        </div>
        <Popover>
          <PopoverTrigger>
            <FaShoppingCart className="h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent className="mt-5 w-[40rem] bg-white">
            <CartPopover />
          </PopoverContent>
        </Popover>
        <div
          className={`p-2 ${
            !session && !showLogin ? "invisible" : ""
          } ${showLogin && !session ? "visible" : ""}`}
        >
          {session ? (
            <AdminMenu />
          ) : (
            <FiLogIn className="text-2xl" onClick={() => signIn("google")} />
          )}
        </div>
      </div>
      <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default NavNew;