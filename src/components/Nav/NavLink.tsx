import Link from "next/link";
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GenerationMenu from "./GenerationMenu";

interface NavLinkProps {
    title: string;
  href: string;
  expand?: boolean;
  //   value: string;
  //   setValue: React.Dispatch<React.SetStateAction<string>>;
}

const NavLink: React.FC<NavLinkProps> = ({ title, href, expand }) => {
  
  const [expanded, setExpanded] = useState<boolean>(false);

  const linkRef = React.useRef<HTMLDivElement>(null);

  const expandMenu = () => {
    if (expand) {
      setExpanded(!expanded);
    }
  }

  return (
    <div ref={linkRef} onClick={() => (expand ? expandMenu() : null)} className="p-2 group">
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
      {expand && expanded ? 
        <GenerationMenu setExpanded={setExpanded} linkRef={linkRef} /> : null
      }
    </div>
  );
};

export default NavLink;
