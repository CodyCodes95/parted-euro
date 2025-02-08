import { useState, useEffect, type KeyboardEvent, useRef } from "react";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface searchBarProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: React.FC<searchBarProps> = ({ showSearch, setShowSearch }) => {
  const [search, setSearch] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [debouncedSearch] = useDebounce(search, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const listings = trpc.listings.getSearchBar.useQuery(
    {
      search: debouncedSearch || "",
    },
    {
      enabled: debouncedSearch !== "",
    },
  );

  useEffect(() => {
    if (showSearch) {
      // Small delay to ensure the animation has started and element is visible
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSearch]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [search]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLDivElement>) => {
    if (!showSearch || !search) return;

    const maxIndex = listings.data?.length ?? 0;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1) {
          await router.push(`/listings?search=${search}`);
          setShowSearch(false);
        } else if (selectedIndex === maxIndex) {
          await router.push(`/listings?search=${search}`);
          setShowSearch(false);
        } else if (listings.data && selectedIndex >= 0) {
          await router.push(`/listings/${listings.data[selectedIndex]!.id}`);
          setShowSearch(false);
        }
        break;
      case "Escape":
        setShowSearch(false);
        break;
    }
  };

  const LoadingSkeleton = () => (
    <li className="px-4 py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </li>
  );

  return (
    <>
      {showSearch && (
        <div
          onMouseDown={() => setShowSearch(!showSearch)}
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
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-8 text-base"
              placeholder="Search by part number, part name, car, etc."
            />
          </div>
          {showSearch && (search !== "" || listings.data?.length) ? (
            <div className="absolute top-20 flex w-full flex-col bg-white shadow-lg md:w-1/2">
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
                  {search !== "" &&
                  (listings.isLoading || debouncedSearch !== search) ? (
                    <>
                      <LoadingSkeleton />
                      <LoadingSkeleton />
                      <LoadingSkeleton />
                    </>
                  ) : (
                    <>
                      {listings.data?.slice(0, 5).map((listing, index) => (
                        <li
                          onMouseDown={async () => {
                            setShowSearch(false);
                            await router.push(`/listings/${listing.id}`);
                          }}
                          key={listing.id}
                          className={`group cursor-pointer px-4 py-3 hover:bg-gray-300 sm:py-4 ${
                            selectedIndex === index ? "bg-gray-200" : ""
                          }`}
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
                        onMouseDown={async () => {
                          setShowSearch(false);
                          await router.push(`/listings?search=${search}`);
                        }}
                        className={`flex h-12 cursor-pointer items-center hover:bg-gray-300 ${
                          selectedIndex === (listings.data?.length || 0)
                            ? "bg-gray-200"
                            : ""
                        }`}
                      >
                        <p className="p-4 text-lg">
                          Search for &quot;{search}&quot;
                        </p>
                        <AiOutlineArrowRight className="ml-auto mr-5" />
                      </li>
                    </>
                  )}
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
