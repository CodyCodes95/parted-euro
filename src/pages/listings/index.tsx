import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import TextField from "@mui/material/TextField";
import placeholder from "../../../public/placeholder.png";
import SearchIcon from "@mui/icons-material/Search";

const Listings: NextPage = () => {
  const router = useRouter();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

    console.log(router.query);

    let input = {}

    const listings = trpc.listings.getAllAvailable.useQuery({});
    
  return (
    <div className="flex min-h-screen w-full flex-col p-24">
      <div className="flex w-full items-center justify-center">
        <TextField className="w-[33%]" label="Search" id="fullWidth" />
        <div className="relative">
          <SearchIcon className="absolute top-[-9px] right-2" />
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-center p-4">
        {listings.data?.map((listing) => (
          <div className="m-6 flex h-[740px] w-[22%] cursor-pointer flex-col justify-between group">
            <div className="max-h-[634px]">
              <img
                src={listing.Images[0]?.url}
                className="h-full duration-100 ease-linear group-hover:scale-105"
                alt=""
              />
            </div>
            <div className="flex flex-col">
              <p className="border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black max-w-fit">{listing.title}</p>
              <p className="text-lg">{formatter.format(listing.price/100).split("A")[1]} AUD</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;


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
  {
    id: "clcgy2w5h0000eh5xut3yli3n",
    title: "Test listing",
    description: "this is a test",
    condition: "Good",
    price: 100000,
    weight: 10000,
    length: 100,
    width: 100,
    height: 50,
    createdAt: "2023-01-04T00:52:14.789Z",
    updatedAt: "2023-01-04T00:52:14.789Z",
    sold: false,
    Images: [
      {
        id: "clcgy2z7c0002eh5xfb29tbdg",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672793537/listings/oqtc1e02i3mqvkkyqsy3.png",
        listingId: "clcgy2w5h0000eh5xut3yli3n",
        createdAt: "2023-01-04T00:52:18.744Z",
        updatedAt: "2023-01-04T00:52:18.744Z",
      },
    ],
  },
  {
    id: "clcgybrm80003eh5xawn9xku4",
    title: "Another test listing",
    description: "!test!",
    condition: "Great!",
    price: 100000,
    weight: 10000,
    length: 100,
    width: 100,
    height: 0,
    createdAt: "2023-01-04T00:59:08.817Z",
    updatedAt: "2023-01-04T00:59:08.817Z",
    sold: false,
    Images: [
      {
        id: "clcgybukc0006eh5xqtkjfft1",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672793951/listings/ckcvrvp1qyp7oggz3awr.png",
        listingId: "clcgybrm80003eh5xawn9xku4",
        createdAt: "2023-01-04T00:59:12.636Z",
        updatedAt: "2023-01-04T00:59:12.636Z",
      },
    ],
  },
];