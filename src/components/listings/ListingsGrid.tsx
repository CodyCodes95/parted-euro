import type {
  Image,
  Listing,
  Part,
  PartDetail,
  PartTypes,
} from "@prisma/client";
import Link from "next/link";
import { useState, type FC } from "react";
import LoadingSpinner from "../Loader";
import { Info, Search } from "lucide-react";

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
    <div className="grid min-h-[50rem] w-full gap-8 md:grid-cols-3 lg:grid-cols-4">
      {listings?.map((listing) => (
        <div
          key={listing.id}
          onMouseEnter={() => setHoveredListing(listing.id)}
          onMouseLeave={() => setHoveredListing("")}
          className="h-fit rounded-xl bg-white shadow-md duration-500 hover:scale-105 hover:shadow-xl"
        >
          <Link href={`/listings/listing?id=${listing.id}`}>
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
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-bag-plus"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z"
                    />
                    <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid;
