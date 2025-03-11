import type { NextPage } from "next";
import { Input } from "../../components/ui/input";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Car,
  Search,
  Share,
  X,
} from "lucide-react";
import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { useIsMobile } from "../../hooks/isMobile";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import Head from "next/head";

const Listings: NextPage = () => {
  const router = useRouter();

  const isMobile = useIsMobile();

  const { series, generation, model, category, subcat, search } = router.query;

  const [showCarSelection, setShowCarSelection] = useState<boolean>(isMobile);
  const [showCategorySelection, setShowCategorySelection] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string | string[]>("");
  const [selectedCar, setSelectedCar] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "title" | "updatedAt">(
    "updatedAt",
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sessionStorageSet, setSessionStorageSet] = useState(false);
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch) {
      void router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            search: debouncedSearch,
            page: 1,
          },
        },
        undefined,
        {
          shallow: true,
        },
      );
    }
  }, [debouncedSearch]);

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
    if (series) {
      setSelectedCar(
        `${series as string} ${(generation as string) ?? ""} ${
          (model as string) ?? ""
        }`,
      );
    }
  }, [series, generation, model]);

  useEffect(() => {
    if (model) setShowCarSelection(false);
  }, [model]);

  const changeSort = (newSort: "price" | "title" | "updatedAt") => {
    if (sortBy === newSort) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortOrder("asc");
      }
    }
    setSortBy(newSort);
  };

  useEffect(() => {
    if (!window) return;
    const sortBy = sessionStorage.getItem("sortBy");
    const sortOrder = sessionStorage.getItem("sortOrder");
    if (sortBy) {
      setSortBy(sortBy as "price" | "title" | "updatedAt");
    }
    if (sortOrder) {
      setSortOrder(sortOrder as "asc" | "desc");
    }
    setSessionStorageSet(true);
  }, []);

  useEffect(() => {
    if (!window || !sessionStorageSet) return;
    sessionStorage.setItem("sortBy", sortBy);
  }, [sortBy, sessionStorageSet]);

  useEffect(() => {
    if (!window || !sessionStorageSet) return;
    sessionStorage.setItem("sortOrder", sortOrder);
  }, [sortOrder, sessionStorageSet]);

  const sortChoices = {
    price: "Price",
    title: "Title",
    updatedAt: "Updated",
  };

  return (
    <>
      <Head>
        <title>Parted Euro - Listings</title>
        <meta name="description" content="Parted Euro - Listings" />
      </Head>
      <div className="flex w-full flex-col">
        <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr]">
          <div className="hidden border-r bg-white/50 shadow-sm backdrop-blur-sm lg:block dark:bg-gray-900/50">
            <CategoryFilters />
          </div>
          <div className="flex flex-col p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full appearance-none bg-white pl-10 text-[14px] shadow-sm ring-1 ring-gray-200 transition-shadow focus-visible:ring-2 dark:bg-gray-900 dark:ring-gray-800"
                  placeholder="Search products..."
                  type="search"
                />
              </div>
              <div className="flex w-full flex-wrap items-center gap-3">
                <Button
                  variant={"outline"}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowCarSelection(true);
                  }}
                  className="flex items-center gap-2 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 dark:ring-gray-800 dark:hover:bg-gray-900"
                >
                  <BsCarFront className="text-gray-500" />
                  <span className="font-medium">
                    {selectedCar || "Select car"}
                  </span>
                </Button>
                {selectedCar && (
                  <X
                    onMouseDown={() => {
                      const query = router.query;
                      delete query.series;
                      delete query.generation;
                      delete query.model;
                      void router.push(
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
                    className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                  />
                )}
                <Button
                  variant={"outline"}
                  className="shadow-sm ring-1 ring-gray-200 md:hidden dark:ring-gray-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowCategorySelection(true);
                  }}
                >
                  {category
                    ? `${category.toString()} ${
                        subcat ? `- ${subcat.toString()}` : ""
                      }`
                    : "Categories"}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="ml-0 flex items-center gap-4 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 md:ml-auto dark:ring-gray-800 dark:hover:bg-gray-900"
                      variant="outline"
                    >
                      {sortChoices[sortBy]}
                      {sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1 shadow-lg">
                    <div className="flex flex-col">
                      <PopoverClose asChild>
                        <button
                          onMouseDown={() => changeSort("title")}
                          className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span>Title</span>
                          {sortBy == "title" && sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : sortBy == "title" && sortOrder === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : null}
                        </button>
                      </PopoverClose>
                      <PopoverClose asChild>
                        <button
                          onMouseDown={() => changeSort("price")}
                          className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span>Price</span>
                          {sortBy == "price" && sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : sortBy == "price" && sortOrder === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : null}
                        </button>
                      </PopoverClose>
                      <PopoverClose asChild>
                        <button
                          onMouseDown={() => changeSort("updatedAt")}
                          className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <span>Updated</span>
                          {sortBy == "updatedAt" && sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : sortBy == "updatedAt" && sortOrder === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : null}
                        </button>
                      </PopoverClose>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <ListingsResults
              sortBy={sortBy}
              sortOrder={sortOrder}
              router={router}
              query={router.query}
              debouncedSearch={debouncedSearch}
            />
          </div>
        </div>
        {showCarSelection ? (
          <Drawer
            title="Find your car"
            onOpenChange={(open) => setShowCarSelection(open)}
            onClose={() => setShowCarSelection(false)}
            open={showCarSelection}
          >
            <CarSelection />
          </Drawer>
        ) : null}
        {showCategorySelection && (
          <Drawer
            title="Select category"
            onOpenChange={(open) => setShowCarSelection(open)}
            onClose={() => setShowCategorySelection(false)}
            open={true}
          >
            <CategoryFilters />
          </Drawer>
        )}
      </div>
    </>
  );
};

export default Listings;

type ListingsResultsProps = {
  query: ParsedUrlQuery;
  debouncedSearch: string | string[];
  router: NextRouter;
  sortBy: "price" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
};

const ListingsResults = ({
  query,
  debouncedSearch,
  router,
  sortBy,
  sortOrder,
}: ListingsResultsProps) => {
  const { series, generation, model, category, subcat, page } = query;

  const isMobile = useIsMobile();

  const listings = trpc.listings.getAllAvailable.useQuery({
    series: series as string,
    generation: generation as string,
    model: model as string,
    search: (debouncedSearch as string) || undefined,
    category: category as string,
    subcat: subcat as string,
    page: Number(page ?? 1) - 1,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const handlePageClick = (page: number) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    void router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          page: page,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  if (listings.isLoading && !isMobile) {
    return (
      <div className="7xl:grid-cols-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 5xl:grid-cols-8 6xl:grid-cols-9">
        {/* eslint-disable-next-line */}
        {[...Array(20)].map((_, i) => (
          <Card key={i} className="h-[320px] overflow-hidden">
            <CardContent className="flex h-full flex-col p-0">
              <div className="relative h-[192px] w-full animate-pulse bg-gray-200" />
              <div className="flex h-[128px] flex-col justify-between p-4">
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.isLoading && isMobile) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        {/* eslint-disable-next-line */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between overflow-hidden rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div className="flex flex-col justify-between gap-2">
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="relative h-36 w-36 animate-pulse overflow-hidden rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.data?.listings.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center">
        <Search className="h-20 w-20 text-gray-300" />
        <h2 className="mt-6 text-2xl font-semibold">No Results Found</h2>
        <p className="mt-2 text-base text-gray-500">
          Try adjusting your search to find what you{"'"}re looking for.
        </p>
      </div>
    );
  }
  return (
    <>
      {isMobile && (
        <div className="mt-8 flex flex-col gap-4">
          {listings.data?.listings.map((listing) => (
            <Link
              href={`/listings/${listing.id}`}
              key={listing.id}
              className="flex justify-between rounded-lg p-2 shadow-md"
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">{listing.title}</p>
                <p className="text-lg font-bold">${listing.price}</p>
              </div>
              <img
                src={listing.images[0]?.url}
                className="h-36 w-36 rounded-md object-cover"
                alt=""
              />
            </Link>
          ))}
        </div>
      )}
      {!isMobile && (
        <>
          <div className="7xl:grid-cols-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 5xl:grid-cols-8 6xl:grid-cols-9">
            {listings.data?.listings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id}>
                <Card className="group h-[320px] overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-0">
                    <div className="relative h-[192px] w-full overflow-hidden">
                      <img
                        alt="Product image"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={listing.images[0]?.url}
                      />
                    </div>
                    <div className="flex h-[128px] flex-col justify-between p-4">
                      <div className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100">
                        {listing.title}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${listing.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="p-4" />

      <Pagination className="py-4">
        <PaginationContent>
          {Number(router.query.page ?? 0) > 1 && (
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 dark:ring-gray-800 dark:hover:bg-gray-900"
                onMouseDown={() =>
                  handlePageClick(Number(router.query.page ?? 0) - 1)
                }
              />
            </PaginationItem>
          )}
          {[
            Number(router.query.page ?? 0) - 2,
            Number(router.query.page ?? 0) - 1,
            Number(router.query.page ?? 0),
            Number(router.query.page ?? 0) + 1,
            Number(router.query.page ?? 0) + 2,
            Number(router.query.page ?? 0) + 3,
          ]
            .filter((page) => page > 0)
            .filter((page) => page <= listings.data!.totalPages)
            .map((page, i) => {
              if (i > 2) return null;
              if (
                (!listings.data?.hasNextPage && i === 3) ||
                (!listings.data?.hasNextPage && i === 3)
              )
                return null;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    className="cursor-pointer shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 dark:ring-gray-800 dark:hover:bg-gray-900"
                    key={page}
                    onMouseDown={() => handlePageClick(page)}
                    isActive={Number(router.query.page ?? 0) === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          {listings.data!.totalPages > Number(page ?? 0) + 4 && (
            <>
              <PaginationEllipsis />
              <PaginationItem className="cursor-pointer">
                <PaginationLink
                  className="cursor-pointer shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 dark:ring-gray-800 dark:hover:bg-gray-900"
                  onMouseDown={() => handlePageClick(listings.data!.totalPages)}
                >
                  {listings.data?.totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          {listings.data?.hasNextPage && (
            <PaginationItem className="cursor-pointer">
              <PaginationNext
                className="shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 dark:ring-gray-800 dark:hover:bg-gray-900"
                onMouseDown={() =>
                  handlePageClick(Number(router.query.page ?? 1) + 1)
                }
              />
            </PaginationItem>
          )}
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
      void router.push({
        pathname: router.pathname,
        query: query,
      });
      return;
    }
    query[key] = value;
    void router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <h2 className="p-4 text-xl font-semibold text-gray-900 dark:text-white">
        Categories
      </h2>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start font-medium ${
              !router.query.category
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                : ""
            }`}
            onMouseDown={() => updateCategory("category", "")}
          >
            All
          </Button>
          {categories.data?.map((category) => (
            <div key={category.id}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start font-medium ${
                  router.query.category === category.name
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : ""
                }`}
                onMouseDown={() => updateCategory("category", category.name)}
              >
                {category.name}
              </Button>
              {category.name === router.query.category && subCategories && (
                <div className="ml-4 space-y-1">
                  {subCategories.data?.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm font-medium ${
                        router.query.subcat === subCategory.name
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                          : ""
                      }`}
                      onMouseDown={() =>
                        updateCategory("subcat", subCategory.name)
                      }
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
  const { series, generation, make } = router.query;
  const [currentTab, setCurrentTab] = useState(
    "make" as "make" | "series" | "generation" | "model",
  );

  // Default to BMW if make is not specified
  const selectedMake = typeof make === "string" ? make : "BMW";

  const makes = trpc.cars.getAllMakes.useQuery();
  const cars = trpc.cars.getAllSeries.useQuery({ make: selectedMake });
  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series, make: selectedMake } as { series: string; make: string },
    {
      enabled: !!series,
    },
  );
  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation, make: selectedMake } as {
      series: string;
      generation: string;
      make: string;
    },
    {
      enabled: !!generation,
    },
  );

  useEffect(() => {
    if (!make) {
      setCurrentTab("make");
    } else if (!series) {
      setCurrentTab("series");
    } else if (!generation) {
      setCurrentTab("generation");
    } else {
      setCurrentTab("model");
    }
  }, [make, series, generation]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs
        value={currentTab}
        onValueChange={(tab) => {
          if (tab === "make") {
            delete router.query.make;
            delete router.query.series;
            delete router.query.generation;
            delete router.query.model;
          } else if (tab === "series") {
            delete router.query.series;
            delete router.query.generation;
            delete router.query.model;
          }
          setCurrentTab(tab as "make" | "series" | "generation" | "model");
        }}
        defaultValue="make"
        className="flex flex-col gap-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="make">{make ?? "Make"}</TabsTrigger>
          <TabsTrigger disabled={!make} value="series">
            {series ?? "Series"}
          </TabsTrigger>
          <TabsTrigger disabled={!series} value="generation">
            {generation ?? "Generation"}
          </TabsTrigger>
          <TabsTrigger disabled={!generation} value="model">
            Model
          </TabsTrigger>
        </TabsList>
        <TabsContent value="make" className="flex">
          {makes.isLoading ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {makes.data?.map((make) => (
                <Button
                  variant="outline"
                  className="relative h-12 overflow-hidden border p-2 transition-all hover:border-primary hover:bg-primary/5"
                  key={make}
                  onMouseDown={() => {
                    router.query.make = make;
                    void router.push(router);
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center font-medium">
                    {make}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="series" className="flex">
          {cars.isLoading ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {cars.data?.series.map((series) => (
                <Button
                  variant="outline"
                  className="relative h-12 overflow-hidden border p-2 transition-all hover:border-primary hover:bg-primary/5"
                  key={series.value}
                  onMouseDown={() => {
                    router.query.series = series.value;
                    void router.push(router);
                    router.query.generation = undefined;
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center font-medium">
                    {series.label}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="generation">
          {generations.isLoading ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {generations.data?.generations.map((generation) => (
                <Button
                  variant="outline"
                  className="relative h-12 overflow-hidden border p-2 transition-all hover:border-primary hover:bg-primary/5"
                  key={generation.value}
                  onMouseDown={() => {
                    router.query.generation = generation.value;
                    void router.push(router);
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center font-medium">
                    {generation.label.split("(")[0]}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="model">
          {models.isLoading ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {models.data?.models.map((model) => (
                <Button
                  variant="outline"
                  className="relative h-12 overflow-hidden border p-2 transition-all hover:border-primary hover:bg-primary/5"
                  key={model.value}
                  onMouseDown={() => {
                    router.query.model = model.value;
                    void router.push(router);
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center font-medium">
                    {model.label}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
