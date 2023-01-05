import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "next/link";
import { useState } from "react";

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

  const [mainImage, setMainImage] = useState<string | undefined>(
    listing.data?.Images[0]?.url
  );

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
                    onClick={() => setMainImage(image.url)}
                    src={image.url}
                    className="m-2 h-[161px] w-[161px] border-2"
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
            {formatter.format(listing.data?.price / 100).split("A")[1]} AUD
          </h4>
          <div className="flex flex-col">
            <LoadingButton
              onClick={() => console.log("clicked")}
              className="mb-4 h-12 w-96 bg-[#1976d2]"
              loading={false}
              loadingPosition="end"
              variant="contained"
            >
              Add to Cart
            </LoadingButton>
            <LoadingButton
              onClick={() => console.log("clicked")}
              className="bg-[#3c3844] mb-4 h-12 w-96 text-white hover:bg-black"
              loading={false}
              loadingPosition="end"
              variant="text"
            >
              Buy Now
            </LoadingButton>
          </div>
          <p>
            Pickup available at{" "}
            <span id="link to gmap">Parted Euro Warehouse</span>
          </p>
          <p>Usually ready in 4 hours</p>
          <h4>OEM Part Numbers:</h4>
          parts.map each part no
          <h4>Fitment:</h4>
          parts.map all compatable cars
          <p>
            Please confirm part numbers prior to purchase. May suit other models
            that aren't listed.
          </p>
          <p>
            It is the buyers responsibility to confirm part numbers and fitment
            for their specific car.{" "}
          </p>
          <h4>Condition</h4>
          listing.condition
          <h4>Donor Car:</h4>
          listing.origin
          <h4>Shipping:</h4>
          <p>Shipping is available for this item.</p>
          <p>Available for pickup from our Knoxfield Warehouse. </p>
          <button>Share</button>
        </div>
      </div>
      <div>
        <h4>You may also like</h4>
        <div className="flex">
          <div className="w-[22%]">related product</div>
          <div className="w-[22%]">related product</div>
          <div className="w-[22%]">related product</div>
          <div className="w-[22%]">related product</div>
        </div>
      </div>
    </div>
  );
};

export default Listing;

const test = [
  {
    id: "clcila8pl0000ehvs7ohci9rg",
    title: "Multiple images",
    description: "you heard me",
    condition: "Used",
    price: 100000,
    weight: 10000,
    length: 100,
    width: 100,
    height: 100,
    createdAt: "2023-01-05T04:29:35.001Z",
    updatedAt: "2023-01-05T04:29:35.001Z",
    sold: false,
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
  },
];
