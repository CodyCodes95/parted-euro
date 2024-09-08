import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Button } from "../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { prisma } from "../server/db/client";

interface HomeProps {
    images: { id: string; url: string; order: number }[];
}

export async function getServerSideProps() {
  const carouselImages = await prisma.homepageImage.findMany({
    orderBy: { order: 'asc' },
  });

  return {
    props: {
      images: carouselImages.map((image) => ({
        id: image.id,
        url: image.url,
      })),
    },
  };
}

const Home: NextPage<HomeProps> = ({ images }) => {
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
              {images.map((image) => (
                <CarouselItem key={image.id}>
                  <Image
                    src={image.url}
                    alt="hero"
                    className="h-[95vh] w-full object-cover"
                    width={1920}
                    height={1080}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="flex flex-col items-center justify-center">
            <h1 className="mb-4 text-center text-4xl font-bold text-white drop-shadow-lg">
              BMW Parts
            </h1>
            <Link href="/listings">
              <Button className="bg-white text-black hover:bg-gray-200">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;