import { useEffect, useState } from "react";
import NavBackdrop from "./NavBackdrop";
import { TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";

interface searchBarProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: React.FC<searchBarProps> = ({ showSearch, setShowSearch }) => {
  const [search, setSearch] = useState<string>("");

  const router = useRouter();

    const searchListings = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
        router.push(`/listings?search=${search}`);
        setShowSearch(false);
    }
    };

  return (
    <>
          {showSearch ? <NavBackdrop showSearch={showSearch} setShowSearch={setShowSearch} /> : null}
      <div
        className={`absolute top-[-5rem] flex h-20 w-full items-center justify-center bg-white duration-150 ease-linear ${
          showSearch ? "translate-y-[5rem]" : ""
        }`}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={searchListings}
          className="w-[33%]"
          // label="Search"
          id="fullWidth"
          placeholder="Search by part number, part name, car, etc."
        />
        <div className="relative">
          <SearchIcon className="absolute top-[-9px] right-2" />
        </div>
      </div>
    </>
  );
};

export default SearchBar;
