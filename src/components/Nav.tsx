import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import logo from "../../public/logo.png";
import NavLink from "./Nav/NavLink";
import { useEffect, useRef, useState } from "react";
import NavBackdrop from "./Nav/NavBackdrop";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import AdminMenu from "./Nav/AdminMenu";
import CartPopup from "./Nav/CartPopup";
import SearchBar from "./Nav/SearchBar";

const Nav: React.FC = () => {
  const [width, setWidth] = useState<number>();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [openAdminMenu, setOpenAdminMenu] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);

  const adminRef = useRef<HTMLDivElement>(null);

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
          <div
            className="cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MenuIcon fontSize="large" />
          </div>
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
            <NavLink href=" " title="Shop By Generation" />
            {/* <NavLink href=" " title="Shop By Wheels" /> */}
            <NavLink href="/wrecking" title="Cars Wrecking Now" />
            <NavLink href="/returns-refunds" title="Warrenty & Return Policy" />
            <NavLink href="/contact" title="Contact" />
          </div>
          <div className="flex">
            <div
              onClick={() => setShowSearch(!showSearch)}
              className="cursor-pointer p-2"
            >
              <SearchIcon />
            </div>
            <div className="p-2">
              <ShoppingCartIcon />
            </div>
            <div className="p-2">
              <PersonIcon />
            </div>
            {session ? <NavLink href="/admin" title="Admin" /> : null}
          </div>
        </div>
      </>
    );

  return (
    <div className="flex h-20 w-full items-center justify-between border-b-2 bg-white px-16 py-8">
      <button
        onClick={() => {
          if (session) return;
          setShowLogin(!showLogin);
        }}
        className="absolute left-0 cursor-default text-white"
      >
        G
      </button>
      <div className="flex items-center">
        <Link href="/">
          <img className="mr-6 inline h-8" src={logo.src} alt="" />
        </Link>
        <NavLink href=" " expand={true} title="Shop By Generation" />
        {/* <NavLink href=" " title="Shop By Wheels" /> */}
        <NavLink href="/wrecking" title="Cars Wrecking Now" />
        <NavLink href="/returns-refunds" title="Warranty & Return Policy" />
        <NavLink href="/contact" title="Contact" />
      </div>
      <div className="flex items-center">
        <div
          onClick={() => setShowSearch(!showSearch)}
          className="cursor-pointer p-2"
        >
          <SearchIcon />
        </div>
        {<CartPopup setShowCart={setShowCart} showCart={showCart} />}
        <div
          className={`cursor-pointer p-2 ${
            !session && !showLogin ? "invisible" : ""
          } ${showLogin && !session ? "visible" : ""}`}
        >
          {session ? (
            <div ref={adminRef}>
              <PersonIcon onClick={() => setOpenAdminMenu(!openAdminMenu)} />
            </div>
          ) : (
            <LoginIcon
              onClick={() => signIn("google")}
            />
          )}
        </div>
        {openAdminMenu ? (
          <AdminMenu adminRef={adminRef} open={openAdminMenu} setOpen={setOpenAdminMenu} />
        ) : null}
      </div>
      <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />
    </div>
  );
};

export default Nav;
