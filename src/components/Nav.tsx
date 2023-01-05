import Link from "next/link";
import { useSession } from "next-auth/react";
import logo from "../../public/logo.png";
import NavLink from "./Nav/NavLink";
import { useEffect, useState } from "react";
import NavBackdrop from "./Nav/NavBackdrop";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { TextField } from "@mui/material";

const Nav: React.FC = () => {
  const [width, setWidth] = useState<number>();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    if (width && width <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [width]);

  const { data: session } = useSession();

  if (isMobile)
    return (
      <>
        {showMenu ? <NavBackdrop /> : null}
        <div className="fixed z-[100] flex h-20 w-full items-center justify-between bg-white">
          <p onClick={() => setShowMenu(!showMenu)}>Hamburger</p>
          <Link href="/">
            <img className="mr-8 inline h-8" src={logo.src} alt="" />
          </Link>
        </div>
        <div
          className={`fixed left-[-15rem] z-[55] flex h-screen flex-col justify-between bg-[#bfb9b9da] duration-200 ${
            showMenu ? "translate-x-[15rem]" : ""
          }`}
        >
          <div className="mt-20 flex flex-col">
            <NavLink href="#" title="Shop By Generation" />
            {/* <NavLink href="#" title="Shop By Wheels" /> */}
            <NavLink href="#" title="Cars Wrecking Now" />
            <NavLink href="/returns-refunds" title="Warrenty & Return Policy" />
            <NavLink href="/contact" title="Contact" />
          </div>
          <div className="flex">
            <NavLink href="#" title="Search" />
            <div className="p-2">
              <ShoppingCartIcon />
            </div>
            {session ? (
              <NavLink href="/api/auth/signout" title="Logout" />
            ) : (
              <NavLink href="/api/auth/signin" title="Login" />
            )}
            {session ? <NavLink href="/admin" title="Admin" /> : null}
          </div>
        </div>
      </>
    );

  return (
    <div className="flex h-20 w-full items-center justify-between border-b-2 bg-white px-16 py-8">
      <div className="flex items-center">
        <Link href="/">
          <img className="mr-8 inline h-8" src={logo.src} alt="" />
        </Link>
        <NavLink href="#" title="Home" />
        <NavLink href="#" expand={true} title="Shop By Generation" />
        {/* <NavLink href="#" title="Shop By Wheels" /> */}
        <NavLink href="#" title="Cars Wrecking Now" />
        <NavLink href="/returns-refunds" title="Warrenty & Return Policy" />
        <NavLink href="/contact" title="Contact" />
      </div>
      <div className="flex items-center">
        <div
          onClick={() => setShowSearch(!showSearch)}
          className="cursor-pointer p-2"
        >
          <SearchIcon />
        </div>
        <div className="cursor-pointer p-2">
          <ShoppingCartIcon />
        </div>
        <div className="cursor-pointer p-2">
          <PersonIcon />
        </div>
        {/* {session ? (
          <NavLink href="/api/auth/signout" title="Logout" />
        ) : (
          <NavLink href="/api/auth/signin" title="Login" />
        )}
        {session ? <NavLink href="/admin" title="Admin" /> : null} */}
      </div>
      {showSearch ? (
        <NavBackdrop showSearch={showSearch} setShowSearch={setShowSearch} />
      ) : null}
      <div
        className={`absolute top-[-5rem] flex h-20 w-full items-center justify-center bg-white duration-150 ease-linear ${
          showSearch ? "translate-y-[5rem]" : ""
        }`}
      >
        <TextField className="w-[33%]" label="Search" id="fullWidth" />
        <div className="relative">
          <SearchIcon className="absolute top-[-9px] right-2" />
        </div>
      </div>
    </div>
  );
};

export default Nav;
