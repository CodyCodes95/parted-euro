import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const baseUrl = "https://digitalapi.auspost.com.au";

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

export const ausPostRouter = router({
  getShippingCountries: publicProcedure.query(async () => {
    const res = await fetch(`${baseUrl}/postage/country.json`, {
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    });
    const data = (await res.json()) as ShippingCountryResponse;
    return data.countries.country;
  }),
  getDomesticShippingServices: publicProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        weight: z.number(),
        length: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    )
    .query(async ({ input }): Promise<StripeShippingOption[]> => {
      const { from, to, weight, length, width, height } = input;
      if (weight >= 22) throw new Error("Weight is too heavy");
      const ausPostRes = await fetch(
        `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?length=${length}&width=${width}&height=${height}&weight=${weight}&from_postcode=${from}&to_postcode=${to}`,
        {
          method: "GET",
          headers: {
            "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
          },
        },
      );
      const data =
        (await ausPostRes.json()) as AvailableShippingServicesResponse;
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
    }),
  getInternationalShippingServices: publicProcedure
    .input(
      z.object({
        countryCode: z.string(),
        parcelWeight: z.number(),
      }),
    )
    .query(async ({ input }): Promise<StripeShippingOption[]> => {
      const { countryCode, parcelWeight } = input;
      const res = await fetch(
        `${baseUrl}/postage/parcel/international/service.json?country_code=${countryCode}&weight=${parcelWeight}`,
        {
          headers: {
            "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
          },
        },
      );
      const data = (await res.json()) as AvailableShippingServicesResponse;
      return data.services.service.map((service) => {
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
      });
    }),
});
