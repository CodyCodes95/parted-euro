import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useEffect, useState } from "react";
import type { Car } from "@prisma/client";
import Head from "next/head";
import type { Image } from "@prisma/client";
import { useCart } from "../../context/cartContext";
import { toast } from "sonner";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button } from "../../components/ui/button";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import Link from "next/link";

const Listing: NextPage = () => {
  const router = useRouter();
  const [parts, setParts] = useState<any>(undefined);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  type ListingParts =
    | {
        donor: {
          car: Car;
          vin: string;
          year: number;
          mileage: number;
        } | null;
        partDetails: {
          length: number;
          cars: {
            generation: string;
            model: string;
            series: string;
            body: string | null;
            id: string;
          }[];
          partNo: string;
          weight: number;
          width: number;
          height: number;
        };
      }[]
    | undefined;

  type ListingType = {
    id: string;
    title: string;
    price: number;
    images: Image[];
    parts: {
      donor: {
        car: Car;
        vin: string;
        year: number;
        mileage: number;
      };
      partDetails: {
        cars: {
          id: string;
          generation: string;
          model: string;
          body: string | null;
        }[];
        partNo: string;
        weight: number;
        length: number;
        width: number;
        height: number;
      };
    }[];
  };

  interface CartItem {
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    listingImage: string | undefined;
    quantity: number;
    length: number;
    width: number;
    height: number;
    weight: number;
  }

  const { cart, setCart } = useCart();

  const [quantity, setQuantity] = useState(1);

  const listing = trpc.listings.getListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
    },
  );

  const relatedListings = trpc.listings.getRelatedListings.useQuery(
    {
      generation: listing.data?.parts[0]?.partDetails.cars[0]
        ?.generation as string,
      model: listing.data?.parts[0]?.partDetails.cars[0]?.model as string,
      id: listing.data?.id as string,
    },
    {
      enabled: listing.data !== undefined,
    },
  );

  useEffect(() => {
    if (listing.data?.parts.length) {
      processParts(listing.data?.parts);
    }
  }, [listing.data]);

  const addToCart = (listing: ListingType) => {
    const existingItem = cart.find((i) => i.listingId === listing.id);

    if (existingItem) {
      const updatedCart = cart.map((i) =>
        i.listingId === listing.id ? { ...i, quantity: i.quantity + 1 } : i,
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
        length: listing.parts
          .map((part) => part.partDetails.length)
          .reduce((a, b) => a + b, 0),
        width: listing.parts
          .map((part) => part.partDetails.width)
          .reduce((a, b) => a + b, 0),
        height: listing.parts
          .map((part) => part.partDetails.height)
          .reduce((a, b) => a + b, 0),
        weight: listing.parts
          .map((part) => part.partDetails.weight)
          .reduce((a, b) => a + b, 0),
      };
      toast("Added to cart", {
        action: {
          label: "Checkout",
          onClick: () => router.push("/checkout"),
        },
      });
      setCart([...cart, cartItem]);
    }
  };

  type Series = string;
  type GroupedParts = {
    models: string[];
    generations: string[];
  };

  const processParts = (parts: any) => {
    // Group by series and then by generation
    if (!parts) return;
    const groupedBySeries = parts[0]?.partDetails?.cars.reduce(
      (seriesAcc: any, car: any) => {
        // Initialize the series if not already done
        if (!seriesAcc[car.series]) {
          seriesAcc[car.series] = {};
        }

        // Initialize the generation within the series if not already done
        if (!seriesAcc[car.series][car.generation]) {
          seriesAcc[car.series][car.generation] = [];
        }

        // Add the model to the correct series and generation
        seriesAcc[car.series][car.generation].push(car.model);

        return seriesAcc;
      },
      {},
    );

    setParts(groupedBySeries);
  };

  const quantityAvailable = listing.data?.parts.reduce((acc, cur) => {
    acc += cur.quantity;
    return acc;
  }, 0);

  return (
    <>
      <Head>
        <title>{listing.data?.title}</title>
      </Head>
      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2 2xl:px-96">
        <div className="flex justify-center">
          <ImageCarousel images={listing.data?.images ?? []} />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{listing.data?.title}</h1>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-semibold">
                ${listing.data?.price}
              </span>
            </div>
            <p className="text-xl font-bold pt-8">Description</p>
            <p>{listing.data?.description}</p>
          </div>
          <div className="flex items-center justify-center gap-4 md:justify-normal">
            <Button
              onClick={() => {
                if (quantity > 1) {
                  setQuantity(quantity - 1);
                }
              }}
              className="text-lg"
              variant="outline"
            >
              -
            </Button>
            <span className="text-lg">{quantity}</span>
            <Button
              onClick={() => {
                if (quantityAvailable && quantity < quantityAvailable) {
                  setQuantity(quantity + 1);
                }
              }}
              className="text-lg"
              variant="outline"
            >
              +
            </Button>
            <span className="text-sm">{quantityAvailable} In stock</span>
            {quantityAvailable === 0 ? (
              <Button disabled>Out of stock</Button>
            ) : (
              <Button onClick={() => addToCart(listing.data as ListingType)}>
                Add {quantity} for ${quantity * (listing.data?.price ?? 0)} to
                cart
              </Button>
            )}
          </div>
          <div className="p-4" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 text-sm">
            <p className="font-bold">PARTS</p>
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3">Part</th>
                  <th className="px-4 py-3">Part No.</th>
                  <th className="px-4 py-3">Alternate part no.</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  new Set(
                    listing.data?.parts.map((part) => (
                      <tr key={part.partDetails.partNo}>
                        <td className="px-4 py-3">{part.partDetails.name}</td>
                        <td className="px-4 py-3">{part.partDetails.partNo}</td>
                        <td className="px-4 py-3">
                          {part.partDetails.alternatePartNumbers ?? "NA"}
                        </td>
                      </tr>
                    )),
                  ),
                )}
              </tbody>
            </table>
            {listing.data?.parts.some(
              (part) =>
                part.partDetails.alternatePartNumbers && (
                  <p>
                    {Array.from(
                      new Set(part.partDetails.alternatePartNumbers),
                    ).join(",")}
                  </p>
                ),
            )}
          </div>
        </div>
        <div className="flex w-full flex-col">
          <p className="font-bold">Fits the following cars:</p>
          {parts && (
            <Tabs
              defaultValue={Object.keys(parts ?? {})[0]}
              className="grid w-full gap-4 md:grid-cols-2"
            >
              <TabsList className="h-fit w-full flex-row md:flex-col">
                {Object.entries(parts).map(([series, cars]) => (
                  <TabsTrigger key={series} value={series}>
                    {series}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(parts).map(([series, cars]) => (
                <TabsContent
                  className="max-h-80 w-full overflow-y-scroll"
                  key={series}
                  value={series}
                >
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                      <tr>
                        <th className="px-4 py-3">Generation</th>
                        <th className="px-4 py-3">Models</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(cars as any).map(
                        ([generation, models]: any[]) => (
                          <tr className="border-b bg-white" key={generation}>
                            <td className="px-4 py-4">{generation}</td>
                            <td className="px-4 py-4">{models.join(", ")}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
        <div className="order-2 space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedListings.data?.map((listing) => (
              <Link
                href={`
              /listings/listing?id=${listing.id}
                `}
                key={listing.id}
                className="space-y-2"
              >
                <img
                  alt={listing.title}
                  className="h-auto w-full"
                  height="200"
                  src={listing.images[0]?.url}
                  style={{
                    aspectRatio: "200/200",
                    objectFit: "cover",
                  }}
                  width="200"
                />
                <h3 className="line-clamp-1 text-lg font-bold">
                  {listing.title}
                </h3>
                <p className="line-clamp-3 text-sm">{listing.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Listing;

type ImageCarouselProps = {
  images: Image[];
};

const ImageCarousel = ({ images }: ImageCarouselProps) => {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-10/12"
    >
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="p-1">
              <img
                alt=""
                className="h-auto w-full"
                height="300"
                src={image.url}
                style={{
                  aspectRatio: "300/300",
                  objectFit: "cover",
                }}
                width="300"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
