import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { IoShareOutline } from "react-icons/io5";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-hot-toast";

const Listing: NextPage = () => {
  const router = useRouter();

  const [mainImage, setMainImage] = useState<string>("");

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

  const fourWrecks = trpc.donors.getFourWrecks.useQuery();

  return (
    <>
      <Head>
        <title>
          {donor.data?.year} {donor.data?.car.generation}{" "}
          {donor.data?.car.model}
        </title>
      </Head>
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
            <h2 className="my-6 text-xl">Mileage: {donor.data?.mileage}KM</h2>
            <h3 className="text-2xl">Parts For Sale</h3>
            <div className="p-2"></div>
            {donor.data?.parts
              .reduce((acc, cur: any) => {
                if (acc.find((part) => part.listing.id === cur.listing.id)) {
                  return acc;
                } else {
                  return [...acc, cur];
                }
              }, [] as any[])
              .map((part) =>
                part.listing.map((list: any) => {
                  return (
                    <Link
                      className="hover:underline"
                      key={list.id}
                      href={`/listings/listing?id=${list.id}`}
                    >
                      {list.title}
                    </Link>
                  );
                })
              )}
            <div className="p-2"></div>
            <div className="flex w-full flex-col items-center md:place-items-start">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info("Link copied");
                }}
                className="flex cursor-pointer items-center rounded-md bg-gray-300 p-2"
              >
                <IoShareOutline />
                <span className="ml-2">Share</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="mt-12 text-4xl">More wrecks</h4>
          <div className="flex items-center  text-center">
            {fourWrecks.data?.map((donor) => (
              <div
                key={donor.vin}
                className="group m-6 flex h-[740px] w-[25%] cursor-pointer flex-col justify-between"
                onClick={() => router.push(`wreck?vin=${donor.vin}`)}
              >
                <div className="max-h-[634px]">
                  <img
                    src={donor.imageUrl || ""}
                    className="h-full duration-100 ease-linear group-hover:scale-105"
                    alt=""
                  />
                </div>
                <div className="flex flex-col">
                  <p className="max-w-fit border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black">
                    {donor.year} {donor.car.generation}
                    {donor.car.model}
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
