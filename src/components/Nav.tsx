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
import { LogIn, Menu, Search, X } from "lucide-react";
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
      <div className="z-50 flex w-full items-center justify-between overflow-x-clip border-b-2 pb-1 pt-2">
        <Link href="/">
          <img className="mr-6 inline h-10" src={logo.src} alt="" />
        </Link>
        {menuOpen ? (
          <X onClick={toggleMenu} className="h-8 w-8 cursor-pointer" />
        ) : (
          <div className="flex items-center gap-1">
            <div
              onClick={() => setShowSearch(!showSearch)}
              className="cursor-pointer"
            >
              <Search className="text-xl" />
            </div>
            <div className="relative">
              {cart.length ? (
                <Badge
                  className="absolute -top-2 left-5 text-xs"
                  variant={"destructive"}
                >
                  {cart.length}
                </Badge>
              ) : null}
              <CartPopover />
            </div>
            <Menu onClick={toggleMenu} className="h-8 w-8 cursor-pointer" />
          </div>
        )}
        {menuOpen && (
          <nav className="h-[calc(screen -5rem)] absolute top-[50px] z-50 w-screen bg-white">
            <Link className="group" href="/listings">
              <p className="border-b-2 p-4 duration-75 group-hover:bg-accent group-hover:underline">
                Browse Store
              </p>
            </Link>
            {/* <Accordion type="single" collapsible>
              <AccordionItem value="shop-generation">
                <AccordionTrigger className="pl-4 duration-75 hover:bg-accent">
                  Shop by Generation
                </AccordionTrigger>
                <AccordionContent>
                  {generations.map((generation, i) => {
                    return (
                      <Accordion
                        key={generation.generation}
                        type="single"
                        collapsible
                      >
                        <AccordionItem
                          key={generation.generation}
                          value={generation.generation}
                        >
                          <AccordionTrigger className="pl-6">
                            {generation.generation} - {generation.series}
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="">
                              <li className="flex flex-col" key={i}>
                                <Link
                                  href={`/listings?generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    All {generation.generation} Parts
                                  </div>
                                </Link>

                                <Link
                                  href={`/listings?category=engine&generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    {generation.generation} Engine/Driveline
                                    Parts & Accessories
                                  </div>
                                </Link>

                                <Link
                                  href={`/listings?category=suspension&generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    {generation.generation} Suspension & Brakes
                                  </div>
                                </Link>

                                <Link
                                  href={`/listings?category=interior&generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    {generation.generation} Interior
                                  </div>
                                </Link>

                                <Link
                                  href={`/listings?category=exterior&generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    {generation.generation} Exterior
                                  </div>
                                </Link>

                                <Link
                                  href={`/listings?category=electrical&generation=${generation.param}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="pl-8 text-sm font-medium leading-none">
                                    {generation.generation} Electrical Modules &
                                    Controllers
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion> */}
            {/* <Link className="group" href="/wrecking">
              <p className="border-b-2 p-4 duration-75 group-hover:bg-accent group-hover:underline">
                Cars Wrecking Now
              </p>
            </Link> */}
            <Link className="group" href="/returns-refunds">
              <p className="border-b-2 p-4 duration-75 group-hover:bg-accent group-hover:underline">
                Warranty & Return Policy
              </p>
            </Link>
            <Link className="group" href="/contact">
              <p className="border-b-2 p-4 duration-75 group-hover:bg-accent group-hover:underline">
                Contact
              </p>
            </Link>
            {session && (
              <Link className="group" href="/admin">
                <p className="border-b-2 p-4 duration-75 group-hover:bg-accent group-hover:underline">
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
    <div className="flex w-full items-center justify-between overflow-x-clip border-b-2 bg-white px-8 py-4">
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
        <img className="mr-6 inline h-8 min-w-[6rem]" src={logo.src} alt="" />
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/listings" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Browse Store
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Shop By Generation</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="right-0 grid w-screen gap-x-5 gap-y-8 p-6 lg:grid-cols-6">
                {generations.map((generation, i) => {
                  return (
                    <li className="flex flex-col" key={i}>
                      <h4 className="rounded-md bg-accent p-2 shadow-md">
                        {generation.generation} - {generation.series}
                      </h4>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            All {generation.generation} Parts
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=engine&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Engine/Driveline Parts &
                            Accessories
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=suspension&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Suspension & Brakes
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=interior&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Interior
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=exterior&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Exterior
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=electrical&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Electrical Modules &
                            Controllers
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            {/* <Link href="/wrecking" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Cars Wrecking Now
              </NavigationMenuLink>
            </Link> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/returns-refunds" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Warranty & Return Policy
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
        <Button
          onClick={() => setShowSearch(!showSearch)}
          className="h-10 w-10 rounded-full p-1"
          variant="ghost"
        >
          <Search className="text-xl" />
        </Button>
        <div className="relative">
          {cart.length ? (
            <Badge
              className="absolute -top-2 left-5 text-xs"
              variant={"destructive"}
            >
              {cart.length}
            </Badge>
          ) : null}
          <CartPopover />
        </div>
        <div
          className={`p-2 ${!session && !showLogin ? "invisible" : ""} ${
            showLogin && !session ? "visible" : ""
          }`}
        >
          {session ? (
            <AdminMenu />
          ) : (
              <LogIn className="text-2xl" onClick={() => signIn("google", {
              
            })} />
          )}
        </div>
      </div>
      <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />
    </div>
  );
};

export default Nav;
