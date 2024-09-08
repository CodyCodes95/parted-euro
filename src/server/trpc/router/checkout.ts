import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { createStripeSession } from "@/pages/api/checkout";

type ShippingCountryResponse = {
  countries: Record<"country", AusPostShippingCodes[]>;
};

type AusPostShippingCodes = {
  code: string;
  name: string;
};

type AvailableShippingServicesResponse = {
  services: {
    service: AusPostShippingService[];
  };
};

type AusPostShippingService = {
  code: string;
  name: string;
  price: string;
  max_extra_cover: number;
  options: {
    option: {
      code: string;
      name: string;
    }[];
  };
};

export type StripeShippingOption = {
  shipping_rate_data: {
    type: string;
    display_name: string;
    fixed_amount: {
      amount: number;
      currency: string;
    };
  };
};

type InterparcelShippingServicesResponse = {
  status: number;
  errorMessage: string;
  services: InterparcelShippingService[];
  invalidServices: never[];
};

type InterparcelShippingService = {
  id: string;
  service: string;
  type: string;
  rapid: {
    quote: string;
    pickup: string;
    transitTimes: string;
  };
};

type InterparcelShippingQuote = {
  status: number;
  shipment: {
    collCountry: string;
    delCountry: string;
  };
  services: {
    id: string;
    service: string;
    carrier: string;
    name: string;
    displayCarrier: string;
    displayName: string;
    realCarrier: string;
    bulkCarrier: string;
    logoImage: string;
    carrierDescription: string;
    description: string;
    warning: string;
    type: string;
    category: string;
    transitCover: number;
    maxTransitCover: number;
    transitCoverPercent: number;
    collAddressType: string;
    delAddressType: string;
    ofdNotifications: string;
    delNotifications: string;
    signature: string;
    signatureSell: number;
    printInStore: null;
    manifestRequired: boolean;
    volumetricWeights: string[];
    printerRequired: boolean;
    maxWeight: number;
    maxLength: number;
    sellPrice: number;
    taxable: string;
    invoiceRequired: string;
    hsCodeRequired: string;
    remote: {
      collection: {
        remote: boolean;
        message: string;
      };
      delivery: {
        remote: boolean;
        price: number;
      };
    };
    pickupDates: {
      status: number;
      pickupType: string;
      dateNow: string;
      timeNow: string;
      cutoffDate: string;
      cutoffTime: string;
      dates: string[];
      window: {
        earliestFrom: string;
        earliestTo: string;
        latestFrom: string;
        latestTo: string;
        minimumWindow: number;
      };
      cached: boolean;
    };
    timeElapsed: number;
  }[];
  invalidServices: never[];
};

const getShippingServicesInputSchema = z.object({
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  destinationCountry: z.string(),
  destinationPostcode: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationState: z.string().optional(),
  b2b: z.boolean(),
});

type ShippingServicesInput = z.infer<typeof getShippingServicesInputSchema>;

// auspost vatiables
const auspostBaseUrl = "https://digitalapi.auspost.com.au";
const supportedShippingMethods = ["Standard", "Express"];

// interparcel variables
const interparcelBaseUrl = "https://au.interparcel.com/api";

const partedEuroAddress = {
  postcode: "3180",
  city: "Knoxfield",
  state: "VIC",
  country: "AU",
};

const pickupShippingOption = {
  shipping_rate_data: {
    type: "fixed_amount",
    fixed_amount: { amount: 0, currency: "aud" },
    display_name: "Pickup from Parted Euro",
  },
};

const getDomesticShippingServices = async (input: ShippingServicesInput) => {
  const { weight, length, width, height, destinationPostcode } = input;
  const ausPostRes = await fetch(
    `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?length=${length}&width=${width}&height=${height}&weight=${weight}&from_postcode=${partedEuroAddress.postcode}&to_postcode=${destinationPostcode}`,
    {
      method: "GET",
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY!,
      },
    },
  );
  const data = (await ausPostRes.json()) as AvailableShippingServicesResponse;
  const express = data.services.service.find(
    (service) => service.code === "AUS_PARCEL_EXPRESS",
  )?.price;
  const regular = data.services.service.find(
    (service) => service.code === "AUS_PARCEL_REGULAR",
  )?.price;
  if (!express || !regular) throw new Error("Shipping not available");
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.ceil(Number(regular) * 100),
          currency: "AUD",
        },
        display_name: "AusPost Regular",
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.ceil(Number(express) * 100),
          currency: "AUD",
        },
        display_name: "AusPost Express",
      },
    },
  ];
};

const getAusPostInternationalShippingServices = async (
  input: ShippingServicesInput,
) => {
  const { destinationCountry, weight } = input;
  const res = await fetch(
    `${auspostBaseUrl}/postage/parcel/international/service.json?country_code=${destinationCountry}&weight=${weight}`,
    {
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY!,
      },
    },
  );
  const data = (await res.json()) as AvailableShippingServicesResponse;
  return data.services.service
    .map((service) => {
      return {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.ceil(Number(service.price) * 100),
            currency: "AUD",
          },
          display_name: service.name,
        },
      };
    })
    .filter((service) =>
      supportedShippingMethods.includes(
        service.shipping_rate_data.display_name,
      ),
    );
};

const getInterparcelShippingServices = async (input: ShippingServicesInput) => {
  const {
    length,
    width,
    height,
    destinationPostcode,
    destinationCountry,
    destinationCity,
    destinationState,
    weight,
    b2b,
  } = input;
  const interparcelParams = {
    source: "booking",
    coll_country: "Australia",
    coll_state: partedEuroAddress.state,
    coll_city: partedEuroAddress.city,
    coll_postcode: partedEuroAddress.postcode,
    del_postcode: destinationPostcode ?? "",
    del_city: destinationCity ?? "",
    del_state: destinationState ?? "",
    del_country: destinationCountry,
    "pkg[0][0]": weight.toString(),
    "pkg[0][1]": length.toString(),
    "pkg[0][2]": width.toString(),
    "pkg[0][3]": height.toString(),
  };
  const searchParams = new URLSearchParams({
    ...interparcelParams,
    type: "parcel",
  });
  const shippingServicesAvailableResponse = await fetch(
    `${interparcelBaseUrl}/quote/availability?${searchParams.toString()}`,
  );
  const shippingServicesAvailableData =
    (await shippingServicesAvailableResponse.json()) as InterparcelShippingServicesResponse;
  if (shippingServicesAvailableData.errorMessage) {
    throw new Error(shippingServicesAvailableData.errorMessage);
  }
  const requests = shippingServicesAvailableData.services
    .filter((service) => !service.service.includes("Hunter"))
    .filter((service) => {
      if (!b2b) return true;
      return !service.service.toLowerCase().includes("b2b");
    })
    .map(async (service) => {
      const searchParams = new URLSearchParams({
        ...interparcelParams,
        service: service.id,
      });
      const response = await fetch(
        `${interparcelBaseUrl}/quote/quote?${searchParams.toString()}`,
        {
          headers: {
            Cookie: "PHPSESSID=f",
          },
        },
      );
      const data = (await response.json()) as InterparcelShippingQuote;
      if (!data.services.length)
        throw new Error("Unable to ship this item to the destination country");
      return {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.ceil(Number(data.services[0]!.sellPrice) * 100),
            currency: "AUD",
          },
          display_name: `${data.services[0]!.carrier} - ${
            data.services[0]!.name
          }`,
        },
      };
    });
  const availableServices = await Promise.all(requests);
  return availableServices.slice(0, 4);
};

export const checkoutRouter = router({
  getAdminCheckoutSession: adminProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            itemId: z.string(),
            quantity: z.number(),
            price: z.number().optional(),
          }),
        ),
        name: z.string(),
        email: z.string(),
        countryCode: z.string(),
        shippingOptions: z.array(
          z.object({
            shipping_rate_data: z.object({
              type: z.string(),
              display_name: z.string(),
              fixed_amount: z.object({
                amount: z.number(),
                currency: z.string(),
              }),
            }),
          }),
        ),
      }),
    )
    .query(async ({ ctx, input }) => {
      const url = await createStripeSession(input);
      return url;
    }),
  getShippingCountries: publicProcedure.query(async () => {
    const res = await fetch(`${auspostBaseUrl}/postage/country.json`, {
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY!,
      },
    });
    const data = (await res.json()) as ShippingCountryResponse;
    const priorityCountries = ["US", "GB", "CA", "BR"];
    const sortedCountries = data.countries.country.sort((a, b) => {
      const indexA = priorityCountries.indexOf(a.code);
      const indexB = priorityCountries.indexOf(b.code);

      if (indexA !== -1 && indexB !== -1) {
        // Both countries are in the priority list
        return indexA - indexB;
      } else if (indexA !== -1) {
        // Only country A is in the priority list
        return -1;
      } else if (indexB !== -1) {
        // Only country B is in the priority list
        return 1;
      } else {
        // Neither country is in the priority list, sort alphabetically
        return a.name.localeCompare(b.name);
      }
    });
    return sortedCountries;
  }),
  getShippingServices: publicProcedure
    .input(getShippingServicesInputSchema)
    .query(async ({ input }): Promise<StripeShippingOption[]> => {
      const { weight, destinationCountry, length, width, height } = input;
      if (weight > 35) return [pickupShippingOption];
      if (weight >= 20) {
        let shippingServices = await getInterparcelShippingServices(input);
        if (destinationCountry === "AU") {
          shippingServices = [...shippingServices, pickupShippingOption];
        }
        return shippingServices;
      }
      if (destinationCountry !== "AU") {
        let shippingServices;
        if ([width, length, height].every((dimension) => dimension < 105)) {
          shippingServices =
            await getAusPostInternationalShippingServices(input);
        } else {
          shippingServices = await getInterparcelShippingServices(input);
        }
        return shippingServices;
      }
      const shippingServices = await getDomesticShippingServices(input);
      return [...shippingServices, pickupShippingOption];
    }),
});
