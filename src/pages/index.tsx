import { type NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import carImg from "../../public/car.jpg";
import four from "../../public/4.jpg";
import five from "../../public/5.jpg";
import six from "../../public/6.jpg";
import eight from "../../public/8.jpg";
import nine from "../../public/9.jpg";

const carImages = [carImg, four, five, six, eight, nine];

const Home: NextPage = () => {
  const [carSelectOpen, setCarSelectOpen] = useState<boolean>(false);
  const [series, setSeries] = useState<string>("");
  const [generation, setGeneration] = useState<string>("");
  const [model, setModel] = useState<string>("");

  const router = useRouter();

  const cars = trpc.cars.getAllSeries.useQuery(undefined, {});

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series },
    {
      enabled: series !== "",
    },
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation },
    {
      enabled: generation !== "",
    },
  );

  return (
    <>
      <Head>
        <title>Parted Euro</title>
        <meta name="description" content="BMW Parts" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex w-full items-center justify-center">
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {carImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={image.src}
                    alt="hero"
                    className="h-screen w-full object-cover"
                    width={image.width}
                    height={image.height}
                    priority
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* <Image
            src={carImg.src}
            alt="hero"
            className="h-[calc(100vh-5rem)] w-full object-cover"
            width={carImg.width}
            height={carImg.height}
            priority
          /> */}
          <div className="absolute w-[50%] text-center text-white">
            <div className="flex w-full flex-col items-center">
              <AnimatePresence>
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className={`absolute w-full duration-150 ease-linear`}
                >
                  <h4 className="text-3xl">BMW Spare Parts Specialists</h4>
                  <p className="mt-2 text-xl">
                    Shop our wide range of second-hand parts from various
                    BMW&apos;s.
                  </p>
                  <div className="mt-4 flex flex-col justify-around gap-4 md:flex-row">
                    <Button
                      className="text-black"
                      variant="outline"
                      onClick={() => router.push("/listings?page=1")}
                    >
                      BROWSE STORE
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* <div className="flex w-full flex-wrap items-center p-4"> */}
          {/* {listings.data?.map((listing) => (
            <Link
            key={listing.id}
            className="group m-6 flex h-[740px] w-[22%] cursor-pointer flex-col justify-between"
            href={`listings/listing?id=${listing.id}`}
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
            </Link>
          ))} */}
        {/* </div> */}
      </main>
    </>
  );
};

export default Home;
