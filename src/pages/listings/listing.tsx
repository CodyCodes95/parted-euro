import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useEffect, useMemo, useState } from "react";
import type { Car } from "@prisma/client";
import Head from "next/head";
import type { Image } from "@prisma/client";
import type { CartItem } from "../../context/cartContext";
import { toast } from "sonner";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button } from "../../components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

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
import { useCartStore } from "../../context/cartStore";
import { cn } from "../../lib/utils";
import { ClassNameValue } from "tailwind-merge";

const Listing: NextPage = () => {
  const router = useRouter();

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

  const { cart, setCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);

  const { data: listing, isLoading } = trpc.listings.getListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
    },
  );

  const carsOnListing = trpc.listings.getAllCarsOnListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
    },
  );

  const relatedListings = trpc.listings.getRelatedListings.useQuery(
    {
      generation: listing?.parts[0]?.partDetails.cars[0]?.generation as string,
      model: listing?.parts[0]?.partDetails.cars[0]?.model as string,
      id: listing?.id as string,
    },
    {
      enabled: !!listing,
    },
  );

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
        quantity: quantity,
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
        itemVin: listing.parts[0]?.donor?.vin.slice(-7) ?? "",
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

  const partsGrouped = useMemo(() => {
    // Group by series and then by generation
    const parts = listing?.parts;
    if (!parts) return;
    const groupedBySeries = parts[0]?.partDetails?.cars.reduce(
      (seriesAcc: any, car: any) => {
        if (!carsOnListing.data!.find((car2) => car2.id === car.id)) {
          return seriesAcc;
        }
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

    return groupedBySeries;
  }, [listing, carsOnListing.data]);

  const quantityAvailable = listing?.parts.reduce((acc, cur) => {
    acc += cur.quantity;
    return acc;
  }, 0);

  const skeletonClasses = "animate-pulse rounded-md bg-gray-200";

  return (
    <>
      <Head>
        <title>{listing?.title}</title>
      </Head>
      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2 2xl:px-96">
        <div className="flex justify-center">
          {isLoading ? (
            <SkeletonCell classNames="h-80 w-full" />
          ) : (
            <ImageCarousel images={listing?.images ?? []} />
          )}
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1
              className={cn(
                "text-2xl font-bold",
                isLoading && `${skeletonClasses} h-8 w-full`,
              )}
            >
              {listing?.title}
            </h1>
            <div className="flex items-center space-x-1">
              <span
                className={cn(
                  "text-xl font-semibold",
                  isLoading && `${skeletonClasses} h-8 w-28`,
                )}
              >
                {listing?.price ? `$${listing?.price}` : ""}
              </span>
            </div>
            <p
              className={cn(
                "pt-8 text-xl font-bold",
                isLoading && `${skeletonClasses} h-8 w-full`,
              )}
            >
              {listing && "Description"}
            </p>
            <p className={cn(isLoading && `${skeletonClasses} h-28 w-full`)}>
              {listing?.description}
            </p>
          </div>
          {isLoading ? (
            <SkeletonCell classNames="h-8 w-full" />
          ) : (
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
                <Button onClick={() => addToCart(listing as ListingType)}>
                  Add to cart
                </Button>
              )}
            </div>
          )}
          <div className="p-4" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 text-sm">
            {isLoading ? (
              <SkeletonCell classNames="h-8 w-28" />
            ) : (
              <p className="font-bold">PARTS</p>
            )}
            {isLoading ? (
              <SkeletonCell classNames="h-52 w-full" />
            ) : (
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
                      listing?.parts
                        .reduce((acc, cur) => {
                          if (
                            !acc.some(
                              (group) =>
                                group.partDetails.partNo ===
                                cur.partDetails.partNo,
                            )
                          )
                            acc.push(cur);
                          return acc;
                        }, [] as any[])
                        .map((part) => (
                          <tr key={part.partDetails.partNo}>
                            <td className="px-4 py-3">
                              {part.partDetails.name}
                            </td>
                            <td className="px-4 py-3">
                              {part.partDetails.partNo}
                            </td>
                            <td className="px-4 py-3">
                              {part.partDetails.alternatePartNumbers ?? "NA"}
                            </td>
                          </tr>
                        )),
                    ),
                  )}
                </tbody>
              </table>
            )}
            {listing?.parts.some(
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
          {isLoading ? (
            <SkeletonCell classNames="h-8 w-full" />
          ) : (
            <p className="font-bold">Fits the following cars:</p>
          )}
          {partsGrouped && (
            <Tabs
              defaultValue={Object.keys(partsGrouped ?? {})[0]}
              className="grid w-full gap-4 md:grid-cols-2"
            >
              <TabsList className="h-fit w-full flex-row md:flex-col">
                {Object.entries(partsGrouped).map(([series, cars]) => (
                  <TabsTrigger key={series} value={series}>
                    {series}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(partsGrouped).map(([series, cars]) => (
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
          {isLoading ? (
            <SkeletonCell classNames="h-8 w-28" />
          ) : (
            <h2 className="text-2xl font-bold">Related Products</h2>
          )}
          <div className="grid gap-4 md:grid-cols-4">
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      <Carousel
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-10/12"
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="p-1">
                <img
                  onClick={() => setLightboxOpen(true)}
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
      <Lightbox
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .8)" },
          thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, .8)" },
          thumbnail: { width: "fit" },
        }}
        plugins={[Thumbnails, Zoom]}
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((image) => ({ src: image.url }))}
      />
    </>
  );
};

const SkeletonCell = ({ classNames }: { classNames: ClassNameValue }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", classNames)} />
  );
};
