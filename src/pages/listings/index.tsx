import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
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
import { useIsMobile } from "../../hooks/isMobile";
import ReactPaginate from "react-paginate";

const Listings: NextPage = () => {
  const router = useRouter();

  const isMobile = useIsMobile();

  const { series, generation, model, category, subcat, search } = router.query;

  const [searchQuery, setSearchQuery] = useState<string | string[]>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
    >([]);
  
  const page = router.query.page ?? 0

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const listings = trpc.listings.getAllAvailable.useQuery(
    {
      series: series as string,
      generation: generation as string,
      model: model as string,
      search: (debouncedSearch as string) || undefined,
      category: category as string,
      subcat: subcat as string,
      page: Number(page)
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // useEffect(() => {
  //   if (listings.data?.length) {
  //     const uniquePartTypes = getUniquePartTypes(listings.data);
  //     setAvailableSubcategories(uniquePartTypes);
  //   } else {
  //     setAvailableSubcategories([]);
  //   }
  // }, [listings.data]);

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
  }, [search]);

  const handlePageClick = (page:{selected:number}) => router.push(`?page=${page.selected}`)

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
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full">
        {/* {!isMobile && (
          <SearchSidebar listings={listings.data} />
        )} */}
        <div className="flex w-full flex-col items-center p-12 gap-4">
          {!isMobile && (
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                placeholder="Search..."
              />
            </div>
          </div>
          )}
          <ListingsGrid
            listings={listings.data?.listings}
            isLoading={listings.isLoading}
          />
        </div>
      </div>
      <div className="p-2">
  <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={(listings.data?.count ?? 0) / 20}
        previousLabel="<"
            renderOnZeroPageCount={null}
          containerClassName="flex w-full justify-center"
          pageClassName="flex"
          previousClassName="flex"
          nextClassName="flex"
          breakClassName="flex"
        pageLinkClassName="px-4 py-2 hover:bg-slate-200 duration-75 rounded-md cursor-pointer"
        activeLinkClassName="text-red-500 bg-slate-200"
       previousLinkClassName="px-4 py-2 hover:bg-slate-200 duration-75 rounded-md cursor-pointer"
        nextLinkClassName="px-4 py-2 hover:bg-slate-200 duration-75 rounded-md cursor-pointer"
        breakLinkClassName="px-4 py-2 hover:bg-slate-200 duration-75 rounded-md cursor-pointer"
        disabledClassName="hidden"
      />
      </div>
    </div>
  );
};

export default Listings;
