import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { IoShareOutline } from "react-icons/io5";
import { useContext, useEffect, useState } from "react";
import type { Car } from "@prisma/client";
import Head from "next/head";
import type { Image } from "@prisma/client";
import CartContext from "../../context/cartContext";
import { toast } from "react-hot-toast";
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

  const { cart, setCart } = useContext(CartContext);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const addToCart = (listing: ListingType) => {
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
      toast.success("Added to cart");
      setCart([...cart, cartItem]);
    }
  };

  const listing = trpc.listings.getListing.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!router.query.id,
    }
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
    }
  );

  const classNames = (...classes: any) => {
    return classes.filter(Boolean).join(" ");
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 1300);
    window.addEventListener("resize", () => {
      setIsMobile(window.innerWidth < 1300);
    });
  }, []);

  const processParts = (parts: ListingParts) => {
    if (!parts) return;
    const result = [] as {
      generation: string;
      models: { model: string; bodies: any }[];
    }[];

    parts.forEach((part) => {
      part.partDetails.cars.forEach((car) => {
        let generationObj = result.find(
          (obj) => obj.generation === car.generation
        );

        if (!generationObj) {
          generationObj = { generation: car.generation, models: [] };
          result.push(generationObj);
        }

        let modelObj = generationObj.models.find(
          (obj) => obj.model === car.model
        );

        if (!modelObj) {
          modelObj = { model: car.model, bodies: new Set() };
          generationObj.models.push(modelObj);
        }

        if (car.body) {
          modelObj.bodies.add(car.body);
        }
      });
    });

    // Convert Set to Array
    result.forEach((generationObj) => {
      generationObj.models.forEach((modelObj) => {
        modelObj.bodies = Array.from(modelObj.bodies);
      });
    });

    return result;
  };

  return (
    <>
      <Head>
        <title>{listing.data?.title}</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col items-center justify-center bg-gray-200 md:flex-row md:p-24">
          <div className="w-[50%]">
            <div className="flex flex-col items-center">
              <Carousel
                thumbWidth={60}
                showThumbs={isMobile ? false : true}
                showArrows={isMobile ? false : true}
              >
                {listing.data?.images.map((image) => {
                  return (
                    <img key={image.id} className="max-w-lg" src={image.url} />
                  );
                })}
              </Carousel>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-4 md:w-[50%] md:place-items-start md:pl-[80px]">
            <h1 className="text-6xl">{listing.data?.title}</h1>
            <h4 className="my-6 text-xl">
              {listing.data?.price
                ? formatter.format(listing.data?.price).split("A")[1]
                : null}{" "}
              AUD
            </h4>
            <div className="flex w-full flex-col items-center md:place-items-start">
              {listing.data?.parts.length ? (
                <>
                  <Select>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        Array(
                          listing.data?.parts.reduce((acc, cur) => {
                            acc += cur.quantity;
                            return acc;
                          }, 0)
                        )
                      ).map((_, i) => {
                        return (
                          <SelectItem key={i} value={(i + 2).toString()}>
                            {i + 1}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => addToCart(listing.data as any)}
                    className="mb-4 h-12 w-[50%] bg-[#1976d2]"
                    variant="ghost"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => console.log("clicked")}
                    className="mb-4 h-12 w-[50%] bg-[#3c3844] text-white hover:bg-black"
                    variant="ghost"
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <p>Out of stock</p>
              )}
            </div>
            <div className="p-2 text-sm">
              <p>
                Pickup available at{" "}
                <span id="link to gmap">Parted Euro Warehouse</span>
              </p>
              <p>Usually ready in 4 hours</p>
            </div>
            <div className="my-6 text-[#4d4d4d]">
              <h4 className="text-xl font-bold ">OEM Part Numbers:</h4>
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
            <div className="my-6 text-[#4d4d4d]">
              <h4 className="text-xl font-bold">Fitment:</h4>
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
                  return part.partDetails.cars
                    .reduce((acc: any, car: Car) => {
                      const { id, generation, model, body } = car;
                      const existingCar = acc.find(
                        (c: any) =>
                          c.generation === generation && c.model === model
                      );
                      if (existingCar) {
                        existingCar.body = `${existingCar.body}, ${body}`;
                      } else {
                        acc.push({ id, generation, model, body });
                      }
                      return acc;
                    }, [])
                    .map((car: Car) => {
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
            <div className="my-6 text-[#4d4d4d]">
              <h4 className="text-xl font-bold">Condition</h4>
              {listing.data?.condition}
            </div>
            <div className="my-6 text-[#4d4d4d]">
              <h4 className="text-xl font-bold">Shipping:</h4>
              <p>Shipping is available for this item.</p>
              <p>Available for pickup from our Knoxfield Warehouse. </p>
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
              }}
              className="flex cursor-pointer items-center rounded-md bg-gray-300 p-2"
            >
              <IoShareOutline />
              <span className="ml-2">Share</span>
            </div>
          </div>
        </div>
        <Spacer amount="3" />
        <div className="flex w-full">
          <div className="w-1/2"></div>
          <div className="flex bg-gray-200">
            <Tab.Group>
              <Tab.List className="flex flex-col p-1">
                {processParts(listing.data?.parts)?.map((generation) => (
                  <Tab
                    key={generation.generation}
                    className={({ selected }) =>
                      classNames(
                        "w-full py-2.5 px-2 text-left text-sm font-medium leading-5 text-black",
                        selected
                          ? "bg-white font-bold shadow"
                          : " hover:bg-gray-300"
                      )
                    }
                  >
                    {generation.generation}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="ml-2">
                {processParts(listing.data?.parts)?.map((generation) => (
                  <Tab.Panel
                    key={generation.generation}
                    className={classNames(
                      "bg-white",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400"
                    )}
                  >
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-2">Model</th>
                          <th className="px-4 py-2">Body</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generation.models.map((model) => (
                          <tr
                            className="border-b bg-white dark:border-gray-700 dark:bg-gray-900"
                            key={model.model}
                          >
                            <td className="px-4 py-4">{model.model}</td>
                            <td className="px-4 py-4">
                              {model.bodies.length
                                ? model.bodies.join(",")
                                : "All"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
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
                    {formatter.format(listing.price).split("A")[1]} AUD
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
