import { type NextPage } from "next";
import Head from "next/head";
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
import Link from "next/link";

const carImages = [carImg, four, five, six, eight, nine];

const Home: NextPage = () => {
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
      <main className="flex min-h-[90vh] flex-col bg-white">
        <div className="flex h-full w-full items-center justify-center">
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
                    className="h-[95vh] w-full object-cover"
                    width={image.width}
                    height={image.height}
                    priority
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute flex h-full w-full flex-col items-center justify-center text-center text-white">
            <div className="flex w-full flex-col items-center">
              {/* <AnimatePresence> */}
                <div
                  // initial={{ x: 300, opacity: 0 }}
                  // animate={{ x: 0, opacity: 1 }}
                  // exit={{ x: -300, opacity: 0 }}
                  className={`absolute w-full duration-150 ease-linear`}
                >
                  <h4 className="text-3xl">BMW Spare Parts Specialists</h4>
                  <p className="mt-2 text-xl">
                    Shop our wide range of second-hand parts from various
                    BMW&apos;s.
                  </p>
                  <div className="mt-4 flex flex-col justify-around gap-4 md:flex-row">
                    <Link href="/listings?page=1">
                      <Button className="text-black" variant="outline">
                        BROWSE STORE
                      </Button>
                    </Link>
                  </div>
                </div>
              {/* </AnimatePresence> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
