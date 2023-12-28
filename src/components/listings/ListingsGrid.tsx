import type {
  Image,
  Listing,
  Part,
  PartDetail,
  PartTypes,
} from "@prisma/client";
import { useState, type FC } from "react";
import LoadingSpinner from "../ui/Loader";
import { Info, Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/router";
import { useIsMobile } from "../../hooks/isMobile";
import { Drawer } from "../ui/Drawer";

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
  const [selectedCar, setSelectedCar] = useState();

  const router = useRouter();

  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        <Drawer onClose={() => console.log("close")} open={!selectedCar} />
        {listings.map((listing) => (
 <div key={listing.id} className="max-w-sm mx-auto bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden mb-5">
    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src={listing.images[0]?.url} alt="product" />
    <div className="p-4">
      <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2">{listing.title}</h5>
      <p className="font-normal text-gray-700 mb-3">{listing.description}</p>
      <p className="text-gray-900 font-semibold text-xl">${listing.price}</p>
    </div>
  </div>
        ))}
        </div>
    )
  }

  return (
    <div className="grid w-full gap-8 md:grid-cols-3 lg:grid-cols-4">
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
