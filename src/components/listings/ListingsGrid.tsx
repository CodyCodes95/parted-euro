import type {
  Image,
  Listing,
  Part,
  PartDetail,
  PartTypes,
} from "@prisma/client";
import { useState, type FC } from "react";
import LoadingSpinner from "../Loader";
import { Info, Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/router";

type ListingsGridProps = {
  listings:
    | (Listing & {
        parts: (Part & {
          partDetails: PartDetail & { partTypes: PartTypes[] };
        })[];
        images: Image[];
      })[]
    | undefined;
  isLoading: boolean;
};

const ListingsGrid: FC<ListingsGridProps> = ({ listings, isLoading }) => {
  const [hoveredListing, setHoveredListing] = useState("");

  const router = useRouter();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!listings?.length) {
    return (
      <div>
        <div className="mt-12 flex min-h-[50rem] w-full flex-col items-center">
          <Search className="h-48 w-48 opacity-20" />
          <p className="mt-4 text-3xl">No parts found</p>
          <span className="flex">
            <Info />
            <p className="ml-2">Try adjusting your search and trying again</p>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid cursor-pointer min-h-[50rem] w-full gap-8 md:grid-cols-3 lg:grid-cols-4">
      {listings?.map((listing) => (
        <div
          key={listing.id}
          onMouseEnter={() => setHoveredListing(listing.id)}
          onMouseLeave={() => setHoveredListing("")}
          className="h-fit rounded-xl bg-white shadow-md duration-500 hover:scale-105 hover:shadow-xl"
        >
          <div
            onClick={() => router.push(`/listings/listing?id=${listing.id}`)}
          >
            <img
              src={
                hoveredListing === listing.id
                  ? listing.images[1]?.url
                  : listing.images[0]?.url
              }
              alt="Product"
              className="h-80 w-full rounded-t-xl object-cover"
            />
            <div className="w-full px-4 py-3">
              <p className="block truncate text-lg font-bold capitalize text-black">
                {listing.title}
              </p>
              <div className="flex items-center">
                <p className="my-3 cursor-auto text-lg font-semibold text-black">
                  ${listing.price}
                </p>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="z-50 ml-auto rounded-md p-2 hover:bg-gray-200"
                >
                  <ShoppingBag />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid;
