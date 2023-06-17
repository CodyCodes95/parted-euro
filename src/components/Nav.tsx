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
import { FiLogIn } from "react-icons/fi";
import CartContext from "../context/cartContext";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { forwardRef, useContext, useRef, useState } from "react";

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
  const { cart, setCart } = useContext(CartContext);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [openAdminMenu, setOpenAdminMenu] = useState<boolean>(false);

  const adminRef = useRef<HTMLDivElement>(null);
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
              <ul className="grid w-screen gap-y-8 gap-x-5 p-6 lg:grid-cols-6">
                {generations.map((generation, i) => {
                  return (
                    <li className="flex flex-col" key={i}>
                      <h4>
                        {generation.generation} - {generation.series}
                      </h4>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {generation.generation} Suspension and & Brakes
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/listings?category=interior&generation=${generation.param}`}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
          className={`p-2 ${!session && !showLogin ? "invisible" : ""} ${
            showLogin && !session ? "visible" : ""
          }`}
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
};

const ListItem = forwardRef<
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

export default Nav;
