import { type NextPage } from "next";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import type { Donor, Car, Image as PrismaImage } from "@prisma/client";
import { trpc } from "@/utils/trpc";

interface DonorWithCar extends Omit<Donor, "car"> {
  car: Pick<Car, "make" | "model" | "body">;
  images: PrismaImage[];
}

const SkeletonDonorCard = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

const WreckingPage: NextPage = () => {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");

  const { data: donors, isLoading } = trpc.donors.getAllPublic.useQuery();
  const { data: makes } = trpc.cars.getAllMakes.useQuery();

  const filteredDonors = donors?.filter((donor) => {
    const matchesSearch =
      donor.car.make.toLowerCase().includes(search.toLowerCase()) ||
      donor.car.model.toLowerCase().includes(search.toLowerCase()) ||
      donor.vin.toLowerCase().includes(search.toLowerCase());

    const matchesMake = makeFilter ? donor.car.make === makeFilter : true;
    const matchesYear = yearFilter
      ? donor.year.toString() === yearFilter
      : true;

    return matchesSearch && matchesMake && matchesYear;
  }) as DonorWithCar[];

  const years = donors
    ? [...new Set(donors.map((donor) => donor.year))].sort(
        (a: number, b: number) => b - a,
      )
    : [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">Donor Vehicles</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          placeholder="Search by make, model, or VIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />

        <Select value={makeFilter} onValueChange={setMakeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by make" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Makes</SelectItem> */}
            {makes?.map((make: string) => (
              <SelectItem key={make} value={make}>
                {make}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Years</SelectItem> */}
            {years.map((year: number) => (
              <SelectItem key={year.toString()} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonDonorCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDonors?.map((donor: DonorWithCar) => (
            <Link key={donor.vin} href={`/wrecking/wreck/${donor.vin}`}>
              <Card className="h-full transition-transform hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle>
                    {donor.year} {donor.car.make} {donor.car.model}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(donor.imageUrl ?? donor.images[0]?.url) && (
                    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                      <Image
                        src={donor.imageUrl ?? donor.images[0]?.url ?? ""}
                        alt={`${donor.year} ${donor.car.make} ${donor.car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p>VIN: {donor.vin}</p>
                    <p>Mileage: {donor.mileage.toLocaleString()} km</p>
                    <p>Body: {donor.car.body ?? "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WreckingPage;
