import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { type ListingsGetListing, trpc } from "../../utils/trpc";
import { useEffect, useMemo, useState } from "react";
import { PrismaClient, type Car, type Image } from "@prisma/client";
import Head from "next/head";
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
import type { ClassNameValue } from "tailwind-merge";

type GroupedBySeries = Record<string, Record<string, string[]>>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query as { id: string };
  const prisma = new PrismaClient();
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      parts: {
        take: 1,
        select: {
          partDetails: {
            select: {
              partNo: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    return { notFound: true };
  }

  console.log({
    listingMeta: {
      title: listing.title,
      description: listing.description,
      image: listing.images[0]?.url,
      partNo: listing.parts[0]?.partDetails.partNo,
    },
  });

  return {
    props: {
      listingMeta: {
        title: listing.title,
        description: listing.description,
        image: listing.images[0]?.url,
        partNo: listing.parts[0]?.partDetails.partNo,
      },
    },
  };
};

const Listing: NextPage<{
  listingMeta: ListingsGetListing & { image: string; partNo: string };
}> = ({ listingMeta }) => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { cart, setCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);

  const { data: listing, isLoading } = trpc.listings.getListing.useQuery(
    {
      id: id,
    },
    {
      enabled: !!id,
    },
  );

  const listingViewAnalytic = trpc.analytics.listingView.useMutation();

  const carsOnListing = trpc.listings.getAllCarsOnListing.useQuery(
    {
      id: id,
    },
    {
      enabled: !!id,
    },
  );

  const addToCart = (listing: ListingsGetListing) => {
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
        length: Math.max(
          ...listing.parts.map((part) => part.partDetails.length),
        ),
        width: Math.max(...listing.parts.map((part) => part.partDetails.width)),
        height: Math.max(
          ...listing.parts.map((part) => part.partDetails.height),
        ),
        weight: Math.max(
          ...listing.parts.map((part) => part.partDetails.weight),
        ),
        itemVin: listing.parts[0]?.donor?.vin.slice(-7) ?? "",
      };
      toast("Added to cart", {
        action: {
          label: "Checkout",
          onClick: () => void router.push("/checkout"),
        },
      });
      setCart([...cart, cartItem]);
    }
  };

  type GroupedBySeries = Record<string, Record<string, string[]>>;

  const partsGrouped = useMemo(() => {
    const parts = listing?.parts;
    if (!parts?.[0]?.partDetails?.cars || !carsOnListing.data) return null;

    const groupedBySeries = parts[0].partDetails.cars.reduce<GroupedBySeries>(
      (seriesAcc, car) => {
        if (!carsOnListing.data?.find((car2) => car2.id === car.id)) {
          return seriesAcc;
        }

        if (!seriesAcc[car.series]) {
          seriesAcc[car.series] = {};
        }

        if (!seriesAcc[car.series]?.[car.generation]) {
          seriesAcc[car.series]![car.generation] = [];
        }

        seriesAcc[car.series]![car.generation]!.push(car.model);

        return seriesAcc;
      },
      {},
    );

    return groupedBySeries;
  }, [listing, carsOnListing.data]);

  useEffect(() => {
    if (!listing) return;
    void listingViewAnalytic.mutateAsync({
      listingId: listing.id,
    });
  }, [listing]);

  const quantityAvailable =
    listing?.parts.reduce((acc, cur) => {
      acc += cur.quantity;
      return acc;
    }, 0) ?? 1;

  const skeletonClasses = "animate-pulse rounded-md bg-gray-200";

  return (
    <>
      <Head>
        <title>{listingMeta.title}</title>
        <meta
          property="og:title"
          content={`${listingMeta.title} - ${listingMeta.partNo}`}
        />
        <meta
          property="og:description"
          content={`${listingMeta.description} `}
        />
        <meta property="og:image" content={listingMeta.image} />
      </Head>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
          <div className="flex justify-center">
            {isLoading ? (
              <SkeletonCell classNames="h-[35rem] w-full" />
            ) : (
              <ImageCarousel images={listing?.images ?? []} />
            )}
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h1
                className={cn(
                  "text-3xl font-bold tracking-tight text-gray-900",
                  isLoading && `${skeletonClasses} h-10 w-full`,
                )}
              >
                {listing?.title}
              </h1>
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    "text-2xl font-semibold text-gray-900",
                    isLoading && `${skeletonClasses} h-8 w-28`,
                  )}
                >
                  {listing?.price ? `$${listing?.price}` : ""}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h2
                  className={cn(
                    "text-lg font-medium text-gray-900",
                    isLoading && `${skeletonClasses} h-8 w-full`,
                  )}
                >
                  {listing && "Description"}
                </h2>
                <p
                  className={cn(
                    "mt-4 text-base text-gray-600",
                    isLoading && `${skeletonClasses} h-28 w-full`,
                  )}
                >
                  {listing?.description}
                </p>
              </div>
            </div>
            {isLoading ? (
              <SkeletonCell classNames="h-8 w-full" />
            ) : (
              <>
                {quantityAvailable === 0 ? (
                  <Button disabled className="w-full">
                    Out of stock
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Quantity
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-md border border-gray-200">
                        <Button
                          disabled={quantity <= 1}
                          onMouseDown={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1);
                            }
                          }}
                          className="h-10 px-4 text-lg"
                          variant="ghost"
                        >
                          -
                        </Button>
                        <span className="w-12 text-center text-lg">
                          {quantity}
                        </span>
                        <Button
                          disabled={quantityAvailable <= quantity}
                          onMouseDown={() => {
                            if (
                              quantityAvailable &&
                              quantity < quantityAvailable
                            ) {
                              setQuantity(quantity + 1);
                            }
                          }}
                          className="h-10 px-4 text-lg"
                          variant="ghost"
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-sm text-gray-600">
                        {quantityAvailable} available
                      </span>
                      <Button
                        onMouseDown={() => addToCart(listing!)}
                        className="ml-auto"
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200">
              <PartsTable listing={listing} isLoading={isLoading} />
            </div>
            <div className="rounded-lg border border-gray-200">
              {isLoading ? (
                <SkeletonCell classNames="h-8 w-full" />
              ) : (
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-medium text-gray-900">
                    Compatible Vehicles
                  </h2>
                  {partsGrouped && (
                    <FitsFollowingCars partsGrouped={partsGrouped} />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            {listing && <RelatedListings listing={listing} />}
          </div>
        </div>
      </div>
    </>
  );
};

const PartsTable = ({
  listing,
  isLoading,
}: {
  listing: ListingsGetListing | undefined;
  isLoading: boolean;
}) => {
  if (!listing) return null;
  return (
    <div className="overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900">Parts Information</h2>
      </div>
      {isLoading ? (
        <SkeletonCell classNames="h-52 w-full" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Part No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Alternate part no.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from(
                new Set(
                  listing?.parts
                    .reduce(
                      (acc, cur) => {
                        if (
                          !acc.some(
                            (group) =>
                              group.partDetails.partNo ===
                              cur.partDetails.partNo,
                          )
                        )
                          acc.push(cur);
                        return acc;
                      },
                      [] as ListingsGetListing["parts"],
                    )
                    .map((part) => (
                      <tr key={part.partDetails.partNo}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {part.partDetails.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {part.partDetails.partNo}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {part.partDetails.alternatePartNumbers ?? "NA"}
                        </td>
                      </tr>
                    )),
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const RelatedListings: React.FC<{ listing: ListingsGetListing }> = ({
  listing,
}) => {
  const relatedListings = trpc.listings.getRelatedListings.useQuery(
    {
      generation: listing.parts[0]!.partDetails.cars[0]!.generation,
      model: listing.parts[0]!.partDetails.cars[0]!.model,
      id: listing.id,
    },
    {
      enabled: !!listing,
    },
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Related Products</h2>
      {relatedListings.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* eslint-disable-next-line */}
          {[...Array(4)].map((_, index) => (
            <SkeletonCell key={index} classNames="h-[200px] w-full" />
          ))}
        </div>
      ) : relatedListings.isError ? (
        <div>Error loading related listings</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedListings.data?.map((relatedListing) => (
            <Link
              href={`/listings/${relatedListing.id}`}
              key={relatedListing.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  alt={relatedListing.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={relatedListing.images[0]?.url}
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
                  {relatedListing.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {relatedListing.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

type ImageCarouselProps = {
  images: Image[];
};

const FitsFollowingCars: React.FC<{ partsGrouped: GroupedBySeries }> = ({
  partsGrouped,
}) => {
  return (
    <Tabs
      defaultValue={Object.keys(partsGrouped ?? {})[0]}
      className="grid w-full gap-6 md:grid-cols-2"
    >
      <div className="overflow-x-auto md:overflow-x-visible">
        <TabsList className="inline-flex h-fit w-auto min-w-full flex-nowrap rounded-md bg-gray-100 p-1 md:w-full md:flex-col">
          {Object.entries(partsGrouped).map(([series]) => (
            <TabsTrigger
              className="min-w-[120px] shrink-0 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm md:w-full"
              key={series}
              value={series}
            >
              {series}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {Object.entries(partsGrouped).map(([series, cars]) => (
        <TabsContent
          className="h-80 w-full overflow-y-auto overflow-x-hidden rounded-md border border-gray-200"
          key={series}
          value={series}
        >
          <div className="min-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Generation
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Models
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.entries(cars).map(([generation, models]) => (
                  <tr className="hover:bg-gray-50" key={generation}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {generation}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {models.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
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
        className="w-full"
      >
        <CarouselContent>
          {images.map((image: Image) => (
            <CarouselItem key={image.id}>
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <img
                  onMouseDown={() => setLightboxOpen(true)}
                  alt=""
                  className="h-auto w-full cursor-zoom-in transition-transform duration-300 hover:scale-105"
                  height="500"
                  src={image.url}
                  style={{
                    aspectRatio: "1",
                    objectFit: "cover",
                  }}
                  width="500"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <Lightbox
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
          thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, .9)" },
          thumbnail: { width: "fit" },
        }}
        plugins={[Thumbnails, Zoom]}
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((image: Image) => ({ src: image.url }))}
      />
    </>
  );
};

const SkeletonCell = ({ classNames }: { classNames: ClassNameValue }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", classNames)} />
  );
};

export default Listing;
