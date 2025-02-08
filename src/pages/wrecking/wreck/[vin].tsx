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
  Listing,
  Image as PrismaImage,
} from "@prisma/client";
import { trpc } from "@/utils/trpc";

interface Part extends PrismaPart {
  partDetails: PartDetail & {
    partTypes: PartTypes[];
  };
  listing: (Listing & {
    images: PrismaImage[];
  })[];
}

const WreckPage: NextPage = () => {
  const router = useRouter();
  const { vin } = router.query;

  const { data: donor, isLoading: donorLoading } = trpc.donors.getByVin.useQuery(
    { vin: vin as string },
    { enabled: !!vin },
  );

  const { data: parts, isLoading: partsLoading } =
    trpc.parts.getByDonorVin.useQuery(
      { donorVin: vin as string },
      { enabled: !!vin },
    );

  if (donorLoading || partsLoading) {
    return <div>Loading...</div>;
  }

  if (!donor) {
    return <div>Donor not found</div>;
  }

  // Group parts by their type
  const partsByType = parts?.reduce(
    (acc: Record<string, Part[]>, part: Part) => {
      const type = part.partDetails.partTypes[0]?.name ?? "Other";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(part);
      return acc;
    },
    {},
  );

  const partTypes = Object.keys(partsByType ?? {});

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
        <TabsList className="mb-8">
          {partTypes.map((type: string) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        {partTypes.map((type: string) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partsByType?.[type]?.map((part: Part) => (
                <Card key={part.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{part.partDetails.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {part.listing[0]?.images[0] && (
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={part.listing[0].images[0].url}
                          alt={part.partDetails.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p>Part Number: {part.partDetails.partNo}</p>
                      {part.listing[0] && (
                        <>
                          <p>Price: ${part.listing[0].price.toFixed(2)}</p>
                          <Link
                            href={`/listing/${part.listing[0].id}`}
                            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                          >
                            View Listing
                          </Link>
                        </>
                      )}
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
