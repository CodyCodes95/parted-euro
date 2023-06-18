import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";
import ListingCard from "../../components/listings/ListingCard";
import loader from "../../../public/loader.svg";

const Listingss: NextPage = () => {

    const router = useRouter();

    const { series, generation, model, category, subcat } = router.query;

    const [search, setSearch] = useState<string | string[]>(
      router.query.search || ""
    );
    const [hoveredListing, setHoveredListing] = useState<string>("");

    const [debouncedSearch] = useDebounce(search, 500);

    const { ref, inView } = useInView();

    const listings = trpc.listings.getAllAvailable.useInfiniteQuery(
      {
        series: series as string,
        generation: generation as string,
        model: model as string,
        search: (debouncedSearch as string) || undefined,
        category: category as string,
        subcat: subcat as string,
      },
      {
        getNextPageParam: (lastPage:any) =>
          lastPage.nextCursor ? lastPage.nextCursor : undefined,
      }
    );

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <SearchSidebar />
        <div className="flex w-full flex-col items-center p-12">
          <div className="flex w-full justify-between rounded-md bg-slate-50 p-6">
            <p>f</p>
            <div className="relative w-1/4">
              <Search size={24} className="absolute top-2 left-1" />
              <Input className="pl-10" placeholder="Search..." />
            </div>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4">
            {listings.data?.pages.map((page) => (
              <>
                {page.listings.map((listing) => (
                  <ListingCard listing={listing}/>
                ))}
              </>
            ))}
            {listings.hasNextPage && (
              <div
                ref={ref}
                className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24"
              >
                <img
                  className="h-80 w-80"
                  src={loader.src}
                  alt="Loading spinner"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listingss;
