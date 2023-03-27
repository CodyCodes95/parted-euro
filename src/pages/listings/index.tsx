import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import loader from "../../../public/loader.svg";

const Listings: NextPage = () => {
  const router = useRouter();

  const { series, generation, model, category } = router.query;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  const [search, setSearch] = useState<string | string[]>(
    router.query.search || ""
  );
  const [hoveredListing, setHoveredListing] = useState<string>("");

  const [debouncedSearch] = useDebounce(search, 500);

  const listings = trpc.listings.getAllAvailable.useQuery({
    series: series as string,
    generation: generation as string,
    model: model as string,
    search: (debouncedSearch as string) || undefined,
    category: category as string,
  });

  if (listings.isLoading) {
    return (
      <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
        <img className="h-80 w-80" src={loader.src} alt="Loading spinner" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col py-24">
      <div className="flex w-full items-center justify-center">
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[33%]"
          label="Search"
          id="fullWidth"
        />
        <div className="relative">
          <SearchIcon className="absolute top-[-9px] right-2" />
        </div>
      </div>
      <div className="flex w-full items-center p-4 flex-wrap jus">
        {listings.data?.map((listing) => (
          <Link
            onMouseEnter={() => setHoveredListing(listing.id)}
            onMouseLeave={() => setHoveredListing("")}
            key={listing.id}
            className="group m-4 flex h-[740px] w-[22%] cursor-pointer flex-col justify-between"
            href={`listings/listing?id=${listing.id}`}
          >
            <div className="max-h-[634px]">
              <img
                src={
                  hoveredListing === listing.id && listing.images[1]
                    ? listing.images[1]?.url
                    : listing.images[0]?.url
                }
                className="h-full duration-100 ease-linear group-hover:scale-105"
                alt=""
              />
            </div>
            <div className="flex flex-col">
              <p className="max-w-fit border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black">
                {listing.title}
              </p>
              <p className="text-lg">
                {formatter.format(listing.price).split("A")[1]} AUD
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Listings;
