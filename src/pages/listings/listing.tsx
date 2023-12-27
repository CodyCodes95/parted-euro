import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { IoShareOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import type { Car } from "@prisma/client";
import Head from "next/head";
import type { Image } from "@prisma/client";
import { useCart } from "../../context/cartContext";
import { toast } from "sonner";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Tab } from "@headlessui/react";
import Spacer from "../../components/Spacer";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { lstat } from "fs";
import { list } from "postcss";
import Link from "next/link";
import { cn } from "../../lib/utils";

const Listing: NextPage = () => {
  const router = useRouter();

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

  type Series = string;
  type GroupedParts = {
    models: string[];
    generations: string[];
  };

  const processParts = (parts) => {
    // Group by series and then by generation
    if (!parts) return;
    const groupedBySeries = parts[0]?.partDetails?.cars.reduce(
      (seriesAcc, car) => {
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
  };

  console.log(processParts(listing.data?.parts));

  const quantityAvailable = listing.data?.parts.reduce((acc, cur) => {
    acc += cur.quantity;
    return acc;
  }, 0);

  return (
    <>
      <Head>
        <title>{listing.data?.title}</title>
      </Head>
      <div className="grid grid-cols-2 gap-8 p-8">
        <div className="space-y-4">
          <img
            alt={listing.data?.title}
            className="h-auto w-full"
            height="300"
            src={listing.data?.images[0]?.url}
            style={{
              aspectRatio: "300/300",
              objectFit: "cover",
            }}
            width="300"
          />
          <div className="text-sm">
            <p className="font-bold">DESCRIPTION</p>
            <p>{listing.data?.description}</p>
          </div>
          <div className="text-sm">
            <p className="font-bold">PART NUMBERS</p>
            <p>
              OEM Part Number:{" "}
              {Array.from(
                new Set(
                  listing.data?.parts.map((part) => part.partDetails.partNo),
                ),
              ).join(",")}
            </p>
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
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{listing.data?.title}</h1>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-semibold">
                ${listing.data?.price}
              </span>
            </div>

            <p>
              <p>{listing.data?.description}</p>
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
            <span className="text-sm">In stock</span>
          </div>
          {quantityAvailable === 0 ? (
            <Button disabled>Out of stock</Button>
          ) : (
            <Button onClick={() => addToCart(listing.data as ListingType)}>
              Add {quantity} for ${quantity * (listing.data?.price ?? 0)} to
              cart
            </Button>
          )}
          <div className="p-4" />
          <p className="font-bold">Fits the following cars:</p>
          <div className="flex w-full">
            <Tab.Group>
              <Tab.List>
                {Object.entries(processParts(listing.data?.parts) ?? {}).map(
                  ([series, cars]) => (
                    <Tab
                      key={series}
                      className={({ selected }) =>
                        cn(
                          "w-full px-4 py-3 text-left text-sm font-medium leading-5 transition duration-150 ease-in-out",
                          "focus:outline-none focus-visible:ring focus-visible:ring-opacity-75",
                          selected
                            ? "rounded-md bg-white text-blue-600 shadow-lg"
                            : "text-gray-600 hover:bg-white hover:text-blue-500",
                        )
                      }
                    >
                      {series}
                    </Tab>
                  ),
                )}
              </Tab.List>
              <Tab.Panels>
                {Object.entries(processParts(listing.data?.parts) ?? {}).map(
                  ([series, cars]) => (
                    <Tab.Panel key={series} className="rounded-xl p-3">
                      <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                          <tr>
                            <th className="px-4 py-3">Generation</th>
                            <th className="px-4 py-3">Models</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(cars).map(([generation, models]) => (
                            <tr className="border-b bg-white" key={generation}>
                              <td className="px-4 py-4">{generation}</td>
                              <td className="px-4 py-4">{models.join(", ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Tab.Panel>
                  ),
                )}
              </Tab.Panels>
            </Tab.Group>
            {/* <Tab.Group>
              <Tab.List className="flex flex-col space-y-1 rounded-lg bg-gray-100 p-1 shadow">
                {processParts(listing.data?.parts)?.map((generation) => (
                  <Tab
                    key={generation.generation}
                    className={({ selected }) =>
                      cn(
                        "w-full px-4 py-3 text-left text-sm font-medium leading-5 transition duration-150 ease-in-out",
                        "focus:outline-none focus-visible:ring focus-visible:ring-opacity-75",
                        selected
                          ? "rounded-md bg-white text-blue-600 shadow-lg"
                          : "text-gray-600 hover:bg-white hover:text-blue-500",
                      )
                    }
                  >
                    {generation.generation}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="ml-2 mt-3 h-fit rounded-lg bg-white p-4 shadow-md">
                {processParts(listing.data?.parts)?.map((generation) => (
                  <Tab.Panel
                    key={generation.generation}
                    className="rounded-xl p-3"
                  >
                    <table className="w-full text-left text-sm text-gray-700">
                      <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                          <th className="px-4 py-3">Model</th>
                          <th className="px-4 py-3">Body</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generation.models.map((model) => (
                          <tr className="border-b bg-white" key={model.model}>
                            <td className="px-4 py-4">{model.model}</td>
                            <td className="px-4 py-4">
                              {model.bodies.length
                                ? model.bodies.join(", ")
                                : "All"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group> */}
          </div>
          <div></div>
        </div>
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Related Products</h2>
          <div className="grid grid-cols-3 gap-4">
            {relatedListings.data?.map((listing) => (
              <div key={listing.id} className="space-y-2">
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
                <h3 className="text-lg font-bold">{listing.title}</h3>
                <p className="text-sm">{listing.description}</p>
                <Button>Add to Cart</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Listing;
