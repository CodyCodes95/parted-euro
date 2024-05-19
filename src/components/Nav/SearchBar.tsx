import { useState } from "react";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

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

  const listings = trpc.listings.getSearchBar.useQuery(
    {
      search: (debouncedSearch as string) || "",
    },
    {
      enabled: debouncedSearch !== "",
    },
  );

  return (
    <>
      {showSearch && (
        <div
          onClick={() => setShowSearch(!showSearch)}
          className="fixed left-0 top-20 z-[51] h-screen w-full bg-[#00000063]"
        />
      )}
      <div
        className={`absolute left-0 top-[-5rem] z-[55] flex h-20 w-full items-center justify-center bg-white duration-150 ease-linear ${
          showSearch ? "translate-y-[5rem]" : ""
        }`}
      >
        <div className="mx-4 flex w-full flex-col items-center justify-center">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={searchListings}
              className="w-full pl-8 text-base"
              placeholder="Search by part number, part name, car, etc."
            />
          </div>
          {showSearch && listings.data?.length ? (
            <div className="absolute flex w-full md:w-1/2 top-20 flex-col bg-white shadow-lg">
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
                    <li
                      onClick={() => {
                        setShowSearch(false);
                        router.push(`/listings/listing?id=${listing.id}`);
                      }}
                      key={listing.id}
                      className="group cursor-pointer px-4 py-3 hover:bg-gray-300 sm:py-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-20 w-20 rounded-md object-contain"
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
                    <AiOutlineArrowRight className="ml-auto mr-5" />
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
