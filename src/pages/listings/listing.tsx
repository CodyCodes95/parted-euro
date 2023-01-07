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
    if (listing.data?.images[0]) {
      setMainImage(listing.data.images[0].url);
    }
  }, [listing.data]);

  return (
    <div className="flex min-h-screen w-full flex-col p-24">
      <div className="flex">
        <div className="w-[50%]">
          <div className="flex flex-col">
            <img src={mainImage} alt="" />
            <div className="flex w-full">
              {listing.data?.images.map((image) => {
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
            {listing.data?.parts.reduce((acc, cur) => {
              if (!acc.some((part) => part.partDetails.partNo === cur.partDetails.partNo)) {
                acc.push(cur);
              }
              return acc;
            }, [] as any[]
            ).map((part) => {
              return <p key={part.partDetails.partNo}>{part.partDetails.partNo}</p>;
            })}
          </div>
          <div className="my-6">
            <h4 className="text-xl">Fitment:</h4>
            This part fits the following cars:
            {listing.data?.parts.reduce((acc, cur) => {
              if (!acc.some((part) => part.partDetails.partNo === cur.partDetails.partNo)) {
                acc.push(cur);
              }
              return acc;
            }, [] as any[])
            .map((part) => {
              return part.partDetails.cars.map((car) => {
                return (
                  <p key={car.id}>
                    {car.generation} {car.model}
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
            {listing.data?.parts.reduce((acc, cur) => {
              if (!acc.some((part) => part.donor.vin === cur.donor.vin)) {
                acc.push(cur);
              }
              return acc;
            }, [] as any[]).map((part) => {
              return (
                <p key={part.partDetails.partNo}>
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
    title: "E46 M3 Rear Seat Lateral Trim Panel Left",
    description: "E46 M3 Rear Seat Lateral Trim Panel Set",
    condition: "Good",
    price: 100,
    weight: 10,
    length: 10,
    width: 10,
    height: 10,
    images: [
      {
        id: "clck5jep3000yehri83fd4agg",
        url: "https://res.cloudinary.com/codycodes/image/upload/v1672892980/listings/imzoxml30hu9npbwgtq0.png",
        listingId: "clck5je7z000oehri1vasv73z",
        createdAt: "2023-01-06T06:44:21.159Z",
        updatedAt: "2023-01-06T06:44:21.159Z",
      },
    ],
    parts: [
      {
        donor: {
          vin: "WBSBL92060JR08716",
          year: 2003,
          car: {
            id: "clck5jcwo0000ehri48eejx11",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
          mileage: 141000,
        },
        partDetails: {
          partNo: "52207903035",
          cars: [
            {
              generation: "E46",
              model: "M3",
            },
          ],
        },
      },
    ],
  },
];

