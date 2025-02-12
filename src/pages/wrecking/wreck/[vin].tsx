import { type NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Part as PrismaPart,
  PartDetail,
  PartTypes,
  Listing as PrismaListing,
  Image as PrismaImage,
} from "@prisma/client";
import { trpc } from "@/utils/trpc";

interface ExtendedListing extends PrismaListing {
  images: PrismaImage[];
  parts: Array<
    PrismaPart & {
      partDetails: PartDetail & {
        partTypes: PartTypes[];
      };
    }
  >;
}

const LoadingSkeleton = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Skeleton className="mb-4 h-12 w-2/3" />
        <Skeleton className="mb-2 h-6 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-[320px] overflow-hidden">
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
    </div>
  );
};

const PartTypeFilters = ({ partTypes }: { partTypes: string[] }) => {
  const router = useRouter();
  const { category, subcat } = router.query;

  // Group part types into parent categories
  const groupedTypes = partTypes.reduce<Record<string, string[]>>(
    (acc, type) => {
      const [parentCategory, subCategory] = type.split(" - ");
      const parent = parentCategory ?? "Other";

      if (!acc[parent]) {
        acc[parent] = [];
      }
      if (subCategory) {
        acc[parent]!.push(subCategory);
      }
      return acc;
    },
    {},
  );

  const updateCategory = (key: string, value: string) => {
    const query = { ...router.query };
    if (query[key] === value && key === "subcat") {
      delete query.subcat;
      void router.push({
        pathname: router.pathname,
        query,
      });
      return;
    }
    if (key === "category") {
      delete query.subcat;
    }
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
              !category
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                : ""
            }`}
            onMouseDown={() => updateCategory("category", "")}
          >
            All Parts
          </Button>
          {Object.entries(groupedTypes).map(([parentCategory, subTypes]) => (
            <div key={parentCategory}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start font-medium ${
                  category === parentCategory
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : ""
                }`}
                onMouseDown={() => updateCategory("category", parentCategory)}
              >
                {parentCategory}
              </Button>
              {category === parentCategory && subTypes.length > 0 && (
                <div className="ml-4 space-y-1">
                  {subTypes.map((subType) => (
                    <Button
                      key={subType}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm font-medium ${
                        subcat === subType
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                          : ""
                      }`}
                      onMouseDown={() => updateCategory("subcat", subType)}
                    >
                      {subType}
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

const WreckPage: NextPage = () => {
  const router = useRouter();
  const { vin, category, subcat } = router.query;

  const { data: donor, isLoading: donorLoading } =
    trpc.donors.getByVin.useQuery({ vin: vin as string }, { enabled: !!vin });

  const { data: listings = [], isLoading: listingsLoading } =
    trpc.listings.getByDonorVin.useQuery(
      { donorVin: vin as string },
      { enabled: !!vin },
    );

  if (donorLoading || listingsLoading) {
    return <LoadingSkeleton />;
  }

  if (!donor) {
    return <div>Donor not found</div>;
  }

  // Group listings by their part type
  const listingsByType = listings.reduce<Record<string, ExtendedListing[]>>(
    (acc, listing) => {
      const type =
        (listing as ExtendedListing).parts[0]?.partDetails.partTypes[0]?.name ??
        "Other";
      const [parentCategory, subCategory] = type.split(" - ");
      const parent = parentCategory ?? "Other";

      // Add to parent category
      if (!acc[parent]) {
        acc[parent] = [];
      }
      acc[parent]!.push(listing as ExtendedListing);

      // Add to subcategory if it exists
      if (subCategory) {
        const fullType = `${parent} - ${subCategory}`;
        if (!acc[fullType]) {
          acc[fullType] = [];
        }
        acc[fullType]!.push(listing as ExtendedListing);
      }

      return acc;
    },
    {},
  );

  const partTypes = Object.keys(listingsByType);

  const filteredListings = subcat
    ? listingsByType[`${category as string} - ${subcat as string}`] ?? []
    : category
      ? listingsByType[category as string] ?? []
      : Object.values(listingsByType).flat();

  return (
    <div className="flex w-full flex-col">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_400px]">
          <div>
            <h1 className="text-4xl font-bold">
              {donor.year} {donor.car.make} {donor.car.model}
            </h1>
            <p className="mt-2 text-gray-600">VIN: {donor.vin}</p>
            <p className="text-gray-600">
              Mileage: {donor.mileage.toLocaleString()} km
            </p>
          </div>

          {donor.images && donor.images.length > 0 && (
            <div>
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src={donor.images[0]!.url}
                  alt={`${donor.year} ${donor.car.make} ${donor.car.model}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid min-h-screen w-full lg:grid-cols-[300px_1fr]">
        <div className="hidden border-r bg-white/50 shadow-sm backdrop-blur-sm lg:block dark:bg-gray-900/50">
          <PartTypeFilters partTypes={partTypes} />
        </div>

        <div className="flex flex-col p-6">
          <div className="7xl:grid-cols-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredListings.map((listing: ExtendedListing) => (
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
                        {listing.parts[0]?.partDetails.name}
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
        </div>
      </div>
    </div>
  );
};

export default WreckPage;
