import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";
import { Input } from "../../components/ui/input";
import { Car, Search, Share } from "lucide-react";
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
import Link from "next/link";
import { Card, CardContent } from "../../components/ui/card";
import { BsCarFront } from "react-icons/bs";
import { Button } from "../../components/ui/button";
import { Drawer } from "../../components/ui/Drawer";

const Listings: NextPage = () => {
  const router = useRouter();

  const isMobile = useIsMobile();

  const { series, generation, model, category, subcat, search } = router.query;

  const [searchQuery, setSearchQuery] = useState<string | string[]>("");
  const [selectedCar, setSelectedCar] = useState("");
  const categories = trpc.categories.getParentCategories.useQuery();
  const subCategories = trpc.categories.getSubCategoriesByParent.useQuery({
    parentCategoryId: category as string,
  });

  const page = router.query.page ?? 0;

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const listings = trpc.listings.getAllAvailable.useQuery(
    {
      series: series as string,
      generation: generation as string,
      model: model as string,
      search: (debouncedSearch as string) || undefined,
      category: category as string,
      subcat: subcat as string,
      page: Number(page),
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
  }, [search]);

  useEffect(() => {
    if (series && generation && model) {
      setSelectedCar(`${series} ${generation} ${model}`);
    }
  }, [series, generation, model]);

  const handlePageClick = (page: { selected: number }) =>
    router.push(`?page=${page.selected}`);

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

  const updateCategory = (key: string, value: string) => {
    const query = router.query;
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
    <div className="flex w-full flex-col gap-4">
      <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr]">
        <div className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                {categories.data?.map((category) => (
                  <div key={category.id}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        router.query.category === "exterior"
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => updateCategory("category", category.name)}
                    >
                      {category.name}
                    </Button>
                    {category.name === router.query.category &&
                      subCategories && (
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
                              onClick={() =>
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
            <Button
              onClick={() => {
                router.push("/listings");
              }}
              className="flex items-center gap-2"
            >
              <BsCarFront />
              {selectedCar || "Select car"}
            </Button>
          </form>
          {/* <p>
            Shopping{" "}
            {series && generation && model
              ? `for ${series} ${generation} ${model}`
              : ""}
          </p> */}
          {listings.data?.count === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center">
              <Search className="h-20 w-20 text-gray-400" />
              <h2 className="mt-6 text-xl font-bold">No Results Found</h2>
              <p className="text-md mt-2 text-gray-500">
                Try adjusting your search to find what you{"'"}re looking for.
              </p>
            </div>
          )}
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
                      <div className="mt-1 text-lg font-bold">
                        ${listing.price}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <div className="p-2" />
          <ReactPaginate
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
          />
        </div>
      </div>
      {isMobile && !router.query.model && (
        <Drawer open={true}>
          <CarSelection />
        </Drawer>
      )}
    </div>
  );
};

export default Listings;

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
