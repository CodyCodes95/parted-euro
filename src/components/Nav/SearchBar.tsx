import { useState } from "react";
import NavBackdrop from "./NavBackdrop";
import { TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { trpc } from "../../utils/trpc";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface searchBarProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: React.FC<searchBarProps> = ({ showSearch, setShowSearch }) => {
  const [search, setSearch] = useState<string>("");

  const [debouncedSearch] = useDebounce(search, 500);

  const router = useRouter();

  const searchListings = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      router.push(`/listings?search=${search}`);
      setShowSearch(false);
    }
  };

  const listings = trpc.listings.getAllAvailable.useQuery(
    {
      search: (debouncedSearch as string) || undefined,
    },
    {
      enabled: debouncedSearch !== "",
    }
  );

  return (
    <>
      {showSearch ? (
        <NavBackdrop showSearch={showSearch} setShowSearch={setShowSearch} />
      ) : null}
      {/* <div className="relative">
            <SearchIcon className="absolute z-[100] translate-x-[-38rem] translate-y-[-9px]" />
          </div> */}
      <div
        className={`absolute top-[-5rem] left-0 z-[55] flex h-20 w-full items-center justify-center bg-white duration-150 ease-linear ${
          showSearch ? "translate-y-[5rem]" : ""
        }`}
      >
        <div className="flex w-full flex-col items-center">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={searchListings}
            className="w-[33%]"
            // label="Search"
            id="fullWidth"
            placeholder="Search by part number, part name, car, etc."
          />
          {showSearch && listings.data?.length ? (
            <div className="absolute flex w-[33%] translate-y-[3.7rem] flex-col bg-white">
              <div className="flex items-center justify-between border-b-2">
                <h5 className="p-4 text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Products
                </h5>
              </div>
              <div className="flow-root">
                <ul
                  role="list"
                  className="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  {listings.data.slice(0, 5).map((listing) => (
                    <li key={listing.id} className="group cursor-pointer py-3 px-4 hover:bg-gray-300 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-20 w-20 rounded-md"
                            src={listing.images[0]?.url}
                            alt={`${listing.title} image`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base text-gray-900 group-hover:underline dark:text-white">
                            {listing.title}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li
                    onClick={() => {
                      setShowSearch(false);
                      router.push(`/listings?search=${search}`);
                    }}
                    className="flex h-12 cursor-pointer items-center hover:bg-gray-300 "
                  >
                    <p className="p-4 text-lg">
                      Search for &quot;{search}&quot;
                    </p>
                    <ArrowForwardIcon className="ml-auto mr-5" />
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default SearchBar;
