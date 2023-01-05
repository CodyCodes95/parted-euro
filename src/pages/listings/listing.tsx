import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import TextField from "@mui/material/TextField";
import placeholder from "../../../public/placeholder.png";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

const Listing: NextPage = () => {
  const router = useRouter();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  const listing = trpc.listings.getListing.useQuery({
    id: router.query.id as string,
  });

  return <div className="flex min-h-screen w-full flex-col p-24">test</div>;
};

export default Listing;

const test = [
  {
    id: "clcabjopw0008ehrrzopyowk2",
    title: "Test listing with part",
    description: "Testttt",
    condition: "Used",
    price: 1000000,
    weight: 100000,
    length: 1000,
    width: 1000,
    height: 1000,
    createdAt: "2022-12-30T09:34:50.084Z",
    updatedAt: "2022-12-30T09:34:50.084Z",
    sold: false,
    Images: [
      {
        id: "clcabjrjg000behrro4ooafot",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672392893/listings/dam8carpuikuapjndery.png",
        listingId: "clcabjopw0008ehrrzopyowk2",
        createdAt: "2022-12-30T09:34:53.741Z",
        updatedAt: "2022-12-30T09:34:53.741Z",
      },
    ],
  },
];
