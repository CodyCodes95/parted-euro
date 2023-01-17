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
import Link from "next/link";
import { listingRouter } from "../../server/trpc/router/listings";

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
      toast.success("Quantity updated");
      setCart(updatedCart);
    } else {
      const cartItem: CartItem = {
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingImage: listing.images[0]?.url,
        quantity: 1,
      };
      toast.success("Added to cart");
      setCart([...cart, cartItem]);
    }
  };

  const donor = trpc.donors.getSingleWreck.useQuery(
    {
      vin: router.query.vin as string,
    },
    {
      enabled: !!router.query.vin,
      onSuccess: (data) => {
        setMainImage(data?.imageUrl || "");
      },
    }
  );

  // const relatedListings = trpc.listings.getRelatedListings.useQuery(
  //   {
  //     generation: listing.data?.parts[0]?.partDetails.cars[0]
  //       ?.generation as string,
  //     model: listing.data?.parts[0]?.partDetails.cars[0]?.model as string,
  //     id: listing.data?.id as string,
  //   },
  //   {
  //     enabled: listing.data !== undefined,
  //   }
  // );
  return (
    <>
      <Head>
        <title>
          {donor.data?.year} {donor.data?.car.generation}{" "}
          {donor.data?.car.model}
        </title>
      </Head>
      <ToastContainer />
      <div className="flex min-h-screen w-full flex-col md:p-24">
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="w-[50%]">
            <div className="flex flex-col items-center">
              <img
                className="max-w-[30rem] object-contain"
                src={mainImage}
                alt=""
              />
            </div>
          </div>
          <div className="flex w-full flex-col items-center md:w-[50%] md:place-items-start md:pl-[80px]">
            <h1 className="text-6xl">
              {donor.data?.year} {donor.data?.car.generation}{" "}
              {donor.data?.car.model}
            </h1>
            <h4 className="my-6 text-xl">Mileage: {donor.data?.mileage}KM</h4>
            <h2>Parts For Sale</h2>
            {donor.data?.parts.map((part) => (
              part.listing.map(list => {
                return (
                  <Link key={list.id} href={`/listings/listing?id=${list.id}`}>{list.title}</Link>
                )
              })
              ))}
            <div className="flex w-full flex-col items-center md:place-items-start">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info("Link copied");
                }}
                className="flex cursor-pointer items-center"
              >
                <IosShareIcon />
                <button className="ml-2 mt-2">Share</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* <h4 className="mt-12 text-4xl">You may also like</h4>
          <div className="flex items-center  text-center"> */}
          {/* {relatedListings.data?.map((listing) => (
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
                    {formatter.format(listing.price).split("A")[1]} AUD
                  </p>
                </div>
              </div>
            ))} */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default Listing;
