import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";
import type {
  Image,
  Listing,
  Part,
  PartDetail,
  PartTypes,
} from "@prisma/client";
import { Badge } from "../../components/ui/badge";
import ListingsGrid from "../../components/listings/ListingsGrid";

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

  const listings = trpc.listings.getAllAvailable.useQuery({
    series: series as string,
    generation: generation as string,
    model: model as string,
    search: (debouncedSearch as string) || undefined,
    category: category as string,
    subcat: subcat as string,
  });

  useEffect(() => {
    if (listings.data?.length) {
      const uniquePartTypes = getUniquePartTypes(listings.data);
      setAvailableSubcategories(uniquePartTypes);
    }
  }, [listings.data]);

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

  const updateQuery = (key: string, value: string) => {
    const query = router.query;
    if (query[key] === value) {
      delete query[key];
      router.push({
        pathname: router.pathname,
        query: query,
      });
      return;
    }
    query[key] = value;
    router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <SearchSidebar />
        <div className="flex w-full flex-col items-center p-12">
          <div className="flex w-full items-center justify-between rounded-md bg-slate-50 p-6">
            <div className="w-3/4 overflow-x-scroll">
              {availableSubcategories.map((subcat) => (
                <Badge
                  key={subcat}
                  className="m-2 cursor-pointer p-2"
                  onClick={() => {
                    updateQuery("subcat", subcat);
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
          <ListingsGrid
            listings={listings.data}
            isLoading={listings.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Listingss;
