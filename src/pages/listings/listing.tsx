import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "next/link";
import IosShareIcon from "@mui/icons-material/IosShare";
import { useMemo, useState } from "react";

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

  const [mainImage, setMainImage] = useState<string>("");

  useMemo(() => {
    if (listing.data?.Images[0]) {
      setMainImage(listing.data.Images[0].url);
    }
  }, [listing.data]);

  return (
    <div className="flex min-h-screen w-full flex-col p-24">
      <div className="flex">
        <div className="w-[50%]">
          <div className="flex flex-col">
            <img src={mainImage} alt="" />
            <div className="flex w-full">
              {listing.data?.Images.map((image) => {
                return (
                  <img
                    key={image.id}
                    onClick={() => setMainImage(image.url)}
                    src={image.url}
                    className="m-2 h-[161px] w-[161px] border-2 hover:opacity-50"
                    alt=""
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="w-[50%] pl-[80px]">
          <h1 className="text-6xl">{listing.data?.title}</h1>
          <h4 className="my-6 text-xl">
            {listing.data?.price
              ? formatter.format(listing.data?.price / 100).split("A")[1]
              : null}{" "}
            AUD
          </h4>
          <div className="flex flex-col">
            <LoadingButton
              onClick={() => console.log("clicked")}
              className="mb-4 h-12 w-96 bg-[#1976d2]"
              loading={false}
              variant="contained"
            >
              Add to Cart
            </LoadingButton>
            <LoadingButton
              onClick={() => console.log("clicked")}
              className="mb-4 h-12 w-96 bg-[#3c3844] text-white hover:bg-black"
              loading={false}
              variant="text"
            >
              Buy Now
            </LoadingButton>
          </div>
          <div className="p-2 text-sm">
            <p>
              Pickup available at{" "}
              <span id="link to gmap">Parted Euro Warehouse</span>
            </p>
            <p>Usually ready in 4 hours</p>
          </div>
          <div className="my-6">
            <h4 className="text-xl">OEM Part Numbers:</h4>
            {listing.data?.parts.map((part) => {
              return <p key={part.partNo}>{part.partNo}</p>;
            })}
          </div>
          <div className="my-6">
            <h4 className="text-xl">Fitment:</h4>
            This part fits the following cars:
            {listing.data?.parts.map((part) => {
              return part.cars.map((car) => {
                return (
                  <p key={car.car.id}>
                    {car.car.generation} {car.car.model}
                  </p>
                );
              });
            })}
            <p>
              Please confirm part numbers prior to purchase. May suit other
              models that aren't listed.
            </p>
            <p>
              It is the buyers responsibility to confirm part numbers and
              fitment for their specific car.{" "}
            </p>
          </div>
          <div className="my-6">
            <h4 className="text-xl">Condition</h4>
            {listing.data?.condition}
          </div>
          <div className="my-6">
            <h4 className="text-xl">Donor Car:</h4>
            {listing.data?.parts.map((part) => {
              return (
                <p key={part.partNo}>
                  {part.donor.year} {part.donor.car.generation}
                  {part.donor.car.model} // VIN: {part.donor.vin} // {part.donor.mileage}KM
                </p>
              );
            })}
          </div>
          <div className="my-6">
            <h4 className="text-xl">Shipping:</h4>
            <p>Shipping is available for this item.</p>
            <p>Available for pickup from our Knoxfield Warehouse. </p>
          </div>
          <div
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex cursor-pointer items-center"
          >
            <IosShareIcon />
            <button className="ml-2 mt-2">Share</button>
          </div>
        </div>
      </div>
      <div>
        <h4 className="mt-12 text-4xl">You may also like</h4>
        <div className="flex items-center justify-center text-center">
          <div className="w-[25%]">related product</div>
          <div className="w-[25%]">related product</div>
          <div className="w-[25%]">related product</div>
          <div className="w-[25%]">related product</div>
        </div>
      </div>
    </div>
  );
};

export default Listing;

const test = [
  {
    title: "Multiple images",
    description: "you heard me",
    condition: "Used",
    price: 100000,
    weight: 10000,
    length: 100,
    width: 100,
    height: 100,
    Images: [
      {
        id: "clcilaerb0002ehvsuw0t4vs7",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672892979/listings/ddxh15ejzrl380qqmuqp.png",
        listingId: "clcila8pl0000ehvs7ohci9rg",
        createdAt: "2023-01-05T04:29:42.840Z",
        updatedAt: "2023-01-05T04:29:42.840Z",
      },
      {
        id: "clcilaerc0003ehvswowwycua",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672892980/listings/imzoxml30hu9npbwgtq0.png",
        listingId: "clcila8pl0000ehvs7ohci9rg",
        createdAt: "2023-01-05T04:29:42.840Z",
        updatedAt: "2023-01-05T04:29:42.840Z",
      },
      {
        id: "clcilaerc0005ehvsllsuyx27",
        url: "http://res.cloudinary.com/codycodes/image/upload/v1672892982/listings/palju1ftbzhz2l5lmfr6.png",
        listingId: "clcila8pl0000ehvs7ohci9rg",
        createdAt: "2023-01-05T04:29:42.840Z",
        updatedAt: "2023-01-05T04:29:42.840Z",
      },
    ],
    parts: [
      {
        partNo: "52207903035",
        donor: {
          year: 1999,
          car: {
            id: "clca6iy4u0002ehwfolqd8jvr",
            make: "BMW",
            series: "5 Series",
            generation: "E39",
            model: "M5",
          },
        },
        cars: [
          {
            car: {
              id: "clca6iy4u0002ehwfolqd8jvr",
              make: "BMW",
              series: "5 Series",
              generation: "E39",
              model: "M5",
            },
          },
          {
            car: {
              id: "clca6iy4u0007ehwf31h02caj",
              make: "BMW",
              series: "X Series",
              generation: "E53",
              model: "X5",
            },
          },
        ],
      },
    ],
  },
];
