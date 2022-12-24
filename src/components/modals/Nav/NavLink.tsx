import Link from "next/link";
import React from "react";

interface NavLinkProps {
    title: string;
    href: string;
  //   value: string;
  //   setValue: React.Dispatch<React.SetStateAction<string>>;
}

const NavLink: React.FC<NavLinkProps> = ({title, href}) => {

  return (
    <Link className="p-2" href={href}>{title}</Link>
  );
};

export default NavLink;
