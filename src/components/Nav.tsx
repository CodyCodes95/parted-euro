import Link from "next/link"
import { useSession } from "next-auth/react";
import logo from "../../public/logo.png"
import NavLink from "./Nav/NavLink";
import { useEffect, useState } from "react";

const Nav: React.FC = () => {

  // const [width, setWidth] = useState<number>(window.innerWidth);
  // const [isMobile, setIsMobile] = useState<boolean>(false);

  // const handleWindowSizeChange = () => {
  //   setWidth(window.innerWidth);
  // }
  // useEffect(() => {
  //   window.addEventListener("resize", handleWindowSizeChange);
  //   return () => {
  //     window.removeEventListener("resize", handleWindowSizeChange);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (width <= 768) {
  //     setIsMobile(true);
  //   } else {
  //     setIsMobile(false);
  //   }
  // }, [width])

  const { data: session } = useSession();
    return (
      <div className="flex h-20 w-full items-center justify-around bg-white">
        <div>
          <Link href="/">
            <img className="mr-8 inline h-8" src={logo.src} alt="" />
          </Link>
          <NavLink href="#" title="Home" />
          <NavLink href="#" title="Shop By Generation" />
          <NavLink href="#" title="Shop By Wheels" />
          <NavLink href="#" title="Cars Wrecking Now" />
          <NavLink href="#" title="Warrenty & Return Policy" />
          <NavLink href="#" title="Contact" />
        </div>
        <div>
          <NavLink href="#" title="Search" />
          <NavLink href="#" title="Cart" />
          {session ? (
            <NavLink href="/api/auth/signout" title="Logout" />
          ) : (
            <NavLink href="/api/auth/signin"  title="Login"/>
          )}
          {session ? <NavLink href="/admin" title="Admin" /> : null}
        </div>
      </div>
    );
}

export default Nav