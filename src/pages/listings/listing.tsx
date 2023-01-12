import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import LoadingButton from "@mui/lab/LoadingButton";
import IosShareIcon from "@mui/icons-material/IosShare";
import { useContext, useState } from "react";
import { Car } from "@prisma/client";
import Head from "next/head";
import { Listing as ListingType } from "@prisma/client";
import { Image } from "@prisma/client";
import CartContext from "../../context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  interface CartItem {
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    listingImage: string | undefined;
    quantity: number;
  }

  const [mainImage, setMainImage] = useState<string>("");

  const { cart, setCart } = useContext(CartContext);

  const addToCart = (listing: IListing) => {
    const existingItem = cart.find((i) => i.listingId === listing.id);

    if (existingItem) {
      const updatedCart = cart.map((i) =>
        i.listingId === listing.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      toast.success("Quantity updated")
      setCart(updatedCart);
    } else {
      const cartItem: CartItem = {
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingImage: listing.images[0]?.url,
        quantity: 1,
      };
      toast.success("Added to cart")
      setCart([...cart, cartItem]);
    }
  };

  const listing = trpc.listings.getListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
      onSuccess: (data) => {
        setMainImage(data?.images[0]?.url || "");
      },
    }
  );

  const relatedListings = trpc.listings.getRelatedListings.useQuery(
    {
      generation: listing.data?.parts[0]?.partDetails.cars[0]?.generation as string,
      model: listing.data?.parts[0]?.partDetails.cars[0]?.model as string,
      id: listing.data?.id as string,
    },
    {
      enabled: listing.data !== undefined,
    }
  );
  return (
    <>
      <Head>
        <title>{listing.data?.title}</title>
      </Head>
      <ToastContainer />
      <div className="flex min-h-screen w-full flex-col p-24">
        <div className="flex">
          <div className="w-[50%]">
            <div className="flex flex-col">
              <img
                className="max-h-[calc(100vh-20rem)] object-contain"
                src={mainImage}
                alt=""
              />
              <div className="flex w-full">
                {listing.data?.images.map((image) => {
                  return (
                    <img
                      key={image.id}
                      onClick={() => setMainImage(image.url)}
                      src={image.url}
                      className="m-2 h-[161px] w-[161px] cursor-pointer border-2 object-contain hover:opacity-50"
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
                className="mb-4 h-12 w-[50%] bg-[#1976d2]"
                loading={false}
                variant="contained"
              >
                Add to Cart
              </LoadingButton>
              <LoadingButton
                onClick={() => console.log("clicked")}
                className="mb-4 h-12 w-[50%] bg-[#3c3844] text-white hover:bg-black"
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
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.info("Link copied")
              }
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
          <div className="flex items-center  text-center">
            {relatedListings.data?.map((listing) => (
              <div
                key={listing.id}
                className="group m-6 flex h-[740px] w-[25%] cursor-pointer flex-col justify-between"
                onClick={() => router.push(`listing?id=${listing.id}`)}
              >
                <div className="max-h-[634px]">
                  <img
                    src={listing.images[0]?.url}
                    className="h-full duration-100 ease-linear group-hover:scale-105"
                    alt=""
                  />
                </div>
                <div className="flex flex-col">
                  <p className="max-w-fit border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black">
                    {listing.title}
                  </p>
                  <p className="text-lg">
                    {formatter.format(listing.price / 100).split("A")[1]} AUD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Listing;
