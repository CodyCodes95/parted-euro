import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Car, Search, Share, X } from "lucide-react";
import type { NextRouter } from "next/router";
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
import { useIsMobile } from "../../hooks/isMobile";
import ReactPaginate from "react-paginate";
import Link from "next/link";
import { Card, CardContent } from "../../components/ui/card";
import { BsCarFront } from "react-icons/bs";
import { Button } from "../../components/ui/button";
import { Drawer } from "../../components/ui/Drawer";
import type { ParsedUrlQuery } from "querystring";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

const Listings: NextPage = () => {
  const router = useRouter();

  const isMobile = useIsMobile();

  const { series, generation, model, category, subcat, search } = router.query;

  const [showCarSelection, setShowCarSelection] = useState<boolean>(false);
  const [showCategorySelection, setShowCategorySelection] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string | string[]>("");
  const [selectedCar, setSelectedCar] = useState("");

  const page = router.query.page ?? 0;

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
  }, [search]);

  useEffect(() => {
    if (subcat) {
      setShowCategorySelection(false);
    }
  }, [subcat]);

  useEffect(() => {
    if (series && generation && model) {
      setSelectedCar(`${series} ${generation} ${model}`);
    }
  }, [series, generation, model]);

  useEffect(() => {
    if (model) setShowCarSelection(false);
  }, [model]);

  const getUniquePartTypes = (
    listings: (Listing & {
      parts: (Part & {
        partDetails: PartDetail & {
          partTypes: PartTypes[];
        };
      })[];
      images: Image[];
    })[],
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
    <div className="flex w-full flex-col gap-4">
      <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr]">
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <CategoryFilters />
        </div>
        <div className="flex flex-col p-4">
          <form className="flex flex-col gap-4 md:flex-row">
            <div className="relative w-full  md:w-1/2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full appearance-none bg-white pl-8 shadow-none dark:bg-gray-950"
                placeholder="Search products..."
                type="search"
              />
            </div>
            <div className="flex w-full flex-wrap items-center gap-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  const query = router.query;
                  delete query.series;
                  delete query.generation;
                  delete query.model;
                  router.push(
                    {
                      pathname: router.pathname,
                      query: query,
                    },
                    undefined,
                    {
                      shallow: true,
                    },
                  );
                  setSelectedCar("");
                  setShowCarSelection(true);
                }}
                className="flex items-center gap-2"
              >
                <BsCarFront />
                {selectedCar || "Select car"}
              </Button>
              {selectedCar && (
                <X
                  onClick={() => {
                    const query = router.query;
                    delete query.series;
                    delete query.generation;
                    delete query.model;
                    router.push(
                      {
                        pathname: router.pathname,
                        query: query,
                      },
                      undefined,
                      {
                        shallow: true,
                      },
                    );
                    setSelectedCar("");
                  }}
                  className="cursor-pointer hover:text-red-500"
                />
              )}
              <Button
                className="md:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCategorySelection(true);
                }}
              >
                Categories
              </Button>
            </div>
          </form>
          {/* <p>
            Shopping{" "}
            {series && generation && model
              ? `for ${series} ${generation} ${model}`
              : ""}
          </p> */}
          <ListingsResults
            router={router}
            query={router.query}
            debouncedSearch={debouncedSearch}
          />
          <div className="p-2" />
        </div>
      </div>
      {showCarSelection || (isMobile && !router.query.model) ? (
        <Drawer onClose={() => setShowCarSelection(false)} open={true}>
          <CarSelection />
        </Drawer>
      ) : null}
      {showCategorySelection && (
        <Drawer
          onClose={() => setShowCategorySelection(false)}
          height="h-[90%]"
          open={true}
        >
          <CategoryFilters />
        </Drawer>
      )}
    </div>
  );
};

export default Listings;

type ListingsResultsProps = {
  query: ParsedUrlQuery;
  debouncedSearch: string | string[];
  router: NextRouter;
};

const ListingsResults = ({
  query,
  debouncedSearch,
  router,
}: ListingsResultsProps) => {
  const { series, generation, model, category, subcat, page } = query;

  const listings = trpc.listings.getAllAvailable.useQuery(
    {
      series: series as string,
      generation: generation as string,
      model: model as string,
      search: (debouncedSearch as string) || undefined,
      category: category as string,
      subcat: subcat as string,
      page: Number(page ?? 1) - 1,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const handlePageClick = (page: number) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    router.push(`?page=${page}`, undefined, {
      shallow: true,
    });
  };

  if (listings.isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(20)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="h-80 w-full animate-pulse rounded-md bg-gray-200" />
              <div className="p-2">
                <div className="mt-2 h-4 w-1/2 animate-pulse bg-gray-200 text-sm font-medium" />
                <div className="mt-1 h-4 w-1/4 animate-pulse bg-gray-200 text-lg font-bold" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.data?.listings.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center">
        <Search className="h-20 w-20 text-gray-400" />
        <h2 className="mt-6 text-xl font-bold">No Results Found</h2>
        <p className="text-md mt-2 text-gray-500">
          Try adjusting your search to find what you{"'"}re looking for.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.data?.listings.map((listing) => (
          <Card key={listing.id}>
            <Link href={`/listings/listing?id=${listing.id}`}>
              <CardContent className="p-0">
                <img
                  alt="Product image"
                  className="max-h-80 w-full rounded-md object-cover"
                  src={listing.images[0]?.url}
                />
                <div className="p-2">
                  <div className="mt-2 text-sm font-medium">
                    {listing.title}
                  </div>
                  <div className="mt-1 text-lg font-bold">${listing.price}</div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
      <div className="p-4" />
      {/* <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={1}
        pageCount={(listings.data?.count ?? 0) / 20}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="flex w-full justify-center flex-wrap"
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
      /> */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                handlePageClick(Number(router.query.page ?? 0) - 1)
              }
            />
          </PaginationItem>
          {[
            Number(router.query.page ?? 0) - 1,
            Number(router.query.page ?? 0),
            Number(router.query.page ?? 0) + 1,
          ]
            .filter((page) => page > 0)
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  key={page}
                  onClick={() => handlePageClick(page)}
                  isActive={Number(router.query.page ?? 0) === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageClick(Number(router.query.page ?? 0) + 1)
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

const CategoryFilters = () => {
  const router = useRouter();
  const { category } = router.query;
  const categories = trpc.categories.getParentCategories.useQuery();
  const subCategories = trpc.categories.getSubCategoriesByParent.useQuery(
    {
      parentCategoryId: category as string,
    },
    {
      enabled: !!category,
    },
  );

  const updateCategory = (key: string, value: string) => {
    const query = router.query;
    if (query[key] === value && key === "subcat") {
      delete query.subcat;
      return router.push({
        pathname: router.pathname,
        query: query,
      });
    }
    delete query.subcat;
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
    <div className="flex flex-col gap-2">
      <h2 className="p-2 text-2xl">Categories</h2>
      <div className="flex-1 overflow-clip py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {categories.data?.map((category) => (
            <div key={category.id}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  router.query.category === category.name
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => updateCategory("category", category.name)}
              >
                {category.name}
              </Button>
              {category.name === router.query.category && subCategories && (
                <div className="ml-4">
                  {subCategories.data?.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        router.query.subcat === subCategory.name
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => updateCategory("subcat", subCategory.name)}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

const CarSelection = () => {
  const router = useRouter();
  const { series, generation } = router.query;

  const cars = trpc.cars.getAllSeries.useQuery();

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series } as { series: string },
    {
      enabled: !!series,
    },
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation } as { series: string; generation: string },
    {
      enabled: !!generation,
    },
  );

  if (!cars.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xl">Select your series</p>
        <div className="flex flex-wrap gap-2">
          {[...Array(10)].map((_, i) => (
            <Button variant={"outline"} className="animate-pulse
            border p-2 w-36 bg-gray-200

            " key={i} disabled>
              
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xl">Select your series</p>
        <div className="flex flex-wrap gap-2">
          {cars.data?.series.map((series) => (
            <Button
              variant={"outline"}
              className="border p-2"
              key={series.value}
              onClick={() => {
                router.query.series = series.value;
                router.push(router);
              }}
            >
              {series.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xl">Select generation</p>
        <div className="flex flex-wrap gap-2">
          {generations.data?.generations.map((generation) => (
            <Button
              variant={"outline"}
              className="border p-2"
              key={generation.value}
              onClick={() => {
                router.query.generation = generation.value;
                router.push(router);
              }}
            >
              {generation.label.split("(")[0]}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl">Select model</p>
      <div className="flex flex-wrap gap-2">
        {models.data?.models.map((model) => (
          <Button
            variant={"outline"}
            className="border p-2"
            key={model.value}
            onClick={() => {
              router.query.model = model.value;
              router.push(router);
            }}
          >
            {model.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
