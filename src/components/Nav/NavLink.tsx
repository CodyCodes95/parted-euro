import Link from "next/link";
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface NavLinkProps {
    title: string;
  href: string;
  expand?: boolean;
  //   value: string;
  //   setValue: React.Dispatch<React.SetStateAction<string>>;
}

const NavLink: React.FC<NavLinkProps> = ({ title, href, expand }) => {
  
  const [expanded, setExpanded] = useState<boolean>(false);

  const expandMenu = () => {
    if (expand) {
      setExpanded(!expanded);
    }
  }

  return (
    <div onClick={() => (expand ? expandMenu() : null)} className="p-2 group">
      <Link
        className="border-gray-300 duration-100 ease-in-out group-hover:border-b-2"
        href={href}
      >
        {title}
      </Link>
      {expand ? (
        <ExpandMoreIcon
          className={`transition-transform duration-100 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      ) : null}
    </div>
  );
};

export default NavLink;
