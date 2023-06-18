import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";
import ListingCard from "../../components/listings/ListingCard";
import loader from "../../../public/loader.svg";
import type {
  Image,
  Listing,
  Part,
  PartDetail,
  PartTypes,
} from "@prisma/client";
import { Badge } from "../../components/ui/badge";

const Listingss: NextPage = () => {
  const router = useRouter();

  const { series, generation, model, category, subcat } = router.query;

  const [search, setSearch] = useState<string | string[]>(
    router.query.search || ""
  );
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);

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
      getNextPageParam: (lastPage) =>
        lastPage.nextCursor ? lastPage.nextCursor : undefined,
    }
  );

  useEffect(() => {
    if (inView && listings.hasNextPage) {
      listings.fetchNextPage();
    }
  }, [inView, listings]);

  useEffect(() => {
    if (listings.data?.pages) {
      const availableSubcategories = listings.data.pages.reduce((acc, page) => {
        const pageSubcategories = getUniquePartTypes(page.listings);
        return [...acc, ...pageSubcategories];
      }, [] as string[]);
      setAvailableSubcategories(availableSubcategories);
    }
  }, [listings.data?.pages]);

  const getUniquePartTypes = (
    listings: (Listing & {
      parts: (Part & {
        partDetails: PartDetail & {
          partTypes: PartTypes[];
        };
      })[];
      images: Image[];
    })[]
  ) => {
    const partTypeSet = new Set<string>();
    for (const listing of listings) {
      for (const part of listing.parts) {
        for (const partType of part.partDetails.partTypes) {
          partTypeSet.add(partType.name);
        }
      }
    }
    return Array.from(partTypeSet);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <SearchSidebar />
        <div className="flex w-full flex-col items-center p-12">
          <div className="flex w-full justify-between rounded-md bg-slate-50 p-6">
            <div className="flex w-full">
              {availableSubcategories.map((subcat) => (
                <Badge
                  key={subcat}
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    router.push({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                        subcat,
                      },
                    });
                  }}
                >
                  {subcat}
                </Badge>
              ))}
            </div>
            <div className="relative w-1/4">
              <Search size={24} className="absolute top-2 left-1" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                placeholder="Search..."
              />
            </div>
          </div>
          <div className="p-4" />
          <div className="grid w-full gap-8 md:grid-cols-3 lg:grid-cols-4">
            {listings.data?.pages.map((page) => (
              <>
                {page.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </>
            ))}
          </div>
          {listings.hasNextPage && (
            <div
              ref={ref}
              className="flex w-full flex-col items-center justify-center p-24"
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
  );
};

export default Listingss;
