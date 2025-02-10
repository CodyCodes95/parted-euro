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
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import CartPopover from "./Nav/CartPopover";
import AdminMenu from "./Nav/AdminMenu";
import SearchBar from "./Nav/SearchBar";
import { useEffect, useState } from "react";
import { LogIn, Menu, Search, SearchIcon, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { useCartStore } from "../context/cartStore";

const generations = [
  { generation: "F8X", series: "M2/M3/M4", param: "F8" },
  { generation: "E36", series: "3 Series", param: "E36" },
  { generation: "E46", series: "3 Series", param: "E46" },
  { generation: "E34", series: "5 Series", param: "E34" },
  { generation: "E39", series: "5 Series", param: "E39" },
  { generation: "E38", series: "7 Series", param: "E38" },
  { generation: "E31", series: "8 Series", param: "E31" },
  { generation: "E53", series: "X Series", param: "E53" },
];

const Nav = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cart } = useCartStore();

  const { data: session } = useSession();

  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", () => {
      setIsMobile(window.innerWidth < 768);
    });
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setShowSearch(false);
  }, [router]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (isMobile) {
    return (
      <div className="sticky top-0 z-50 flex w-full items-center justify-between overflow-x-clip border-b bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Link href="/">
          <img className="h-8 w-auto" src={logo.src} alt="Logo" />
        </Link>
        {menuOpen ? (
          <div className="flex items-center gap-4">
            <X
              onMouseDown={toggleMenu}
              className="h-6 w-6 cursor-pointer text-gray-700 transition-colors hover:text-gray-900"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div
              onMouseDown={() => setShowSearch(!showSearch)}
              className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </div>
            <div className="relative">
              <CartPopover />
            </div>
            <Menu
              onMouseDown={toggleMenu}
              className="h-6 w-6 cursor-pointer text-gray-700 transition-colors hover:text-gray-900"
            />
          </div>
        )}
        {menuOpen && (
          <nav className="h-[calc(screen -5rem)] absolute top-[50px] z-50 w-screen bg-white">
            <Link className="group block" href="/listings">
              <p className="border-b px-6 py-4 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Browse Store
              </p>
            </Link>
            <Link className="group block" href="/wrecking">
              <p className="border-b px-6 py-4 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Cars Wrecking Now
              </p>
            </Link>
            <Link className="group block" href="/returns-refunds">
              <p className="border-b px-6 py-4 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Warranty & Return Policy
              </p>
            </Link>
            <Link className="group block" href="/contact">
              <p className="border-b px-6 py-4 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Contact
              </p>
            </Link>
            {session && (
              <Link className="group block" href="/admin">
                <p className="border-b px-6 py-4 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  Admin
                </p>
              </Link>
            )}
          </nav>
        )}
        <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 flex w-full items-center justify-between overflow-x-clip border-b bg-white/95 px-8 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <button
        onMouseDown={() => {
          if (session) return;
          setShowLogin(!showLogin);
        }}
        className="absolute left-0 cursor-default text-white"
      >
        G
      </button>
      <Link href="/" className="flex items-center">
        <img className="h-8 w-auto" src={logo.src} alt="Logo" />
      </Link>
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <Link href="/listings" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-gray-700 transition-colors hover:text-gray-900",
                )}
              >
                Browse Store
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/wrecking" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-gray-700 transition-colors hover:text-gray-900",
                )}
              >
                Cars Wrecking Now
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/returns-refunds" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-gray-700 transition-colors hover:text-gray-900",
                )}
              >
                Warranty & Return Policy
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "font-medium text-gray-700 transition-colors hover:text-gray-900",
                )}
              >
                Contact
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        <Button
          onMouseDown={() => setShowSearch(!showSearch)}
          className="h-10 w-10 rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          variant="ghost"
        >
          <SearchIcon className="h-6 w-6" />
        </Button>
        <div className="relative">
          <CartPopover />
        </div>
        <div
          className={`${!session && !showLogin ? "invisible" : ""} ${
            showLogin && !session ? "visible" : ""
          } p-2`}
        >
          {session ? (
            <AdminMenu />
          ) : (
            <LogIn
              className="h-6 w-6 cursor-pointer text-gray-700 transition-colors hover:text-gray-900"
              onMouseDown={() => signIn("google", {})}
            />
          )}
        </div>
      </div>
      <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />
    </div>
  );
};

export default Nav;
