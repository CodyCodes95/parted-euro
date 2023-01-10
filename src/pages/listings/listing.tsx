import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import LoadingButton from "@mui/lab/LoadingButton";
import IosShareIcon from "@mui/icons-material/IosShare";
import { useEffect, useState } from "react";
import { Car } from "@prisma/client";
import Head from "next/head";
import { Listing as ListingType } from "@prisma/client";
import { Image } from "@prisma/client";

const Listing: NextPage = () => {
  const router = useRouter();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  interface IListing extends ListingType {
    images: Image[];
  }

  const [mainImage, setMainImage] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (listing: IListing) => {
    setCart((cartState) => {
      const existingItem = cartState.find(
        (existingItem) => existingItem.listingId === listing.id
        );
        if (existingItem) {
        console.log("run")
        existingItem.quantity += 1;
        return cartState;
      }
      const cartItem = {
        listingId: listing?.id,
        listingTitle: listing?.title,
        listingPrice: listing?.price,
        listingImage: listing?.images[0]?.url,
        quantity: 1,
      };
      return [...cartState, cartItem];
    });
  };

  useEffect(() => {
    console.log(cart)
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const listing = trpc.listings.getListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      onSuccess: (data) => {
        setMainImage(data?.images[0]?.url || "");
        setCart(JSON.parse(localStorage.cart || "[]"));
      },
    }
  );

  return (
    <>
      <Head>
        <title>{listing.data?.title}</title>
      </Head>
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
                onClick={() => addToCart(listing.data as any)}
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
              {listing.data?.parts
                .reduce((acc, cur) => {
                  if (
                    !acc.some(
                      (part) =>
                        part.partDetails.partNo === cur.partDetails.partNo
                    )
                  ) {
                    acc.push(cur);
                  }
                  return acc;
                }, [] as any[])
                .map((part) => {
                  return (
                    <p key={part.partDetails.partNo}>
                      {part.partDetails.partNo}
                    </p>
                  );
                })}
            </div>
            <div className="my-6">
              <h4 className="text-xl">Fitment:</h4>
              This part fits the following cars:
              {listing.data?.parts
                .reduce((acc, cur) => {
                  if (
                    !acc.some(
                      (part) =>
                        part.partDetails.cars[0].id ===
                        cur.partDetails.cars[0]?.id
                    )
                  ) {
                    acc.push(cur);
                  }
                  return acc;
                }, [] as any[])
                .map((part) => {
                  return part.partDetails.cars.map((car: Car) => {
                    return (
                      <p key={car.id}>
                        {car.generation} {car.model} {car.body}
                      </p>
                    );
                  });
                })}
              <p>
                Please confirm part numbers prior to purchase. May suit other
                models that aren&apos;t listed.
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
              {listing.data?.parts
                .reduce((acc, cur) => {
                  if (!acc.some((part) => part.donor.vin === cur.donor.vin)) {
                    acc.push(cur);
                  }
                  return acc;
                }, [] as any[])
                .map((part) => {
                  return (
                    <p key={part.donor.vin}>
                      {part.donor.year} {part.donor.car.generation}
                      {part.donor.car.model} {"//"} VIN: {part.donor.vin} {"//"}{" "}
                      Mileage:
                      {part.donor.mileage}KM
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
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
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
    </>
  );
};

export default Listing;
