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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import type {
  Part as PrismaPart,
  PartDetail,
  PartTypes,
  Listing as PrismaListing,
  Image as PrismaImage,
} from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

      <Skeleton className="mb-8 h-96 w-full rounded-lg" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-4 h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const WreckPage: NextPage = () => {
  const router = useRouter();
  const { vin } = router.query;

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
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(listing as ExtendedListing);
      return acc;
    },
    {},
  );

  const partTypes = Object.keys(listingsByType);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {donor.year} {donor.car.make} {donor.car.model}
        </h1>
        <p className="mt-2 text-gray-600">VIN: {donor.vin}</p>
        <p className="text-gray-600">
          Mileage: {donor.mileage.toLocaleString()} km
        </p>
      </div>

      {donor.imageUrl && (
        <div className="mb-8">
          <div className="relative h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={donor.imageUrl}
              alt={`${donor.year} ${donor.car.make} ${donor.car.model}`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <Tabs defaultValue={partTypes[0] ?? "all"} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6 w-max">
            {partTypes.map((type: string) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {partTypes.map((type: string) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listingsByType[type]?.map((listing: ExtendedListing) => (
                <Card key={listing.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{listing.parts[0]?.partDetails.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {listing.images[0] && (
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={listing.images[0].url}
                          alt={
                            listing.parts[0]?.partDetails.name ?? "Part image"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p>Part Number: {listing.parts[0]?.partDetails.partNo}</p>
                      <p>Price: ${listing.price.toFixed(2)}</p>
                      <Button asChild>
                        <Link href={`/listings/${listing.id}`}>
                          View Listing
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WreckPage;
