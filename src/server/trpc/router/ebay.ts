import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import eBayApi from "ebay-api";
import type {
  FulfillmentPolicyRequest,
  InventoryLocationFull,
} from "ebay-api/lib/types";
import type {
  Condition,
  ContentLanguage,
  CurrencyCode,
  FormatType,
  Marketplace,
} from "ebay-api/lib/enums";
import {
  CategoryType,
  MarketplaceId,
  TimeDurationUnit,
} from "ebay-api/lib/enums";

const ebay = eBayApi.fromEnv();
ebay.config.acceptLanguage = "en-AU";
ebay.config.contentLanguage = "en-AU" as ContentLanguage;
ebay.config.marketplaceId = "EBAY_AU" as MarketplaceId;

const request: FulfillmentPolicyRequest = {
  name: "Fulfilmnet Policy",
  description: "Fulfilmnet Policy sdnifnsdfgnboidsfnvbodsfnvd",
  marketplaceId: MarketplaceId.EBAY_AU,
  handlingTime: {
    unit: TimeDurationUnit.DAY,
    value: 1,
  },
  categoryTypes: [{ name: CategoryType.ALL_EXCLUDING_MOTORS_VEHICLES }],
};

export const ebayRouter = router({
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
    ebay.OAuth2.setScope(process.env.EBAY_SCOPES?.split(" ") as string[]);
    const url = ebay.OAuth2.generateAuthUrl();
    return {
      url: url,
    };
  }),
  updateRefreshToken: adminProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ebay.OAuth2.getToken(input.code);
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
      return {
        updatedCreds,
      };
    }),
  getInventroyItems: adminProcedure.query(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });
    const listings = await ebay.sell.inventory.getInventoryItems();
    return listings;
  }),
  getOffers: adminProcedure.query(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });
    const offers = await ebay.sell.inventory.getOffers({
      sku: "clclircgv000qeh05zxzk1wqa",
      marketplaceId: MarketplaceId.EBAY_AU,
    });
    return offers;
  }),
  getCategoryIds: adminProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const token = await ctx.prisma.ebayCreds.findFirst();
      ebay.OAuth2.setCredentials(token?.refreshToken as any);
      ebay.OAuth2.on("refreshAuthToken", async (token) => {
        const creds = await ctx.prisma.ebayCreds.findFirst();
        const updatedCreds = await ctx.prisma.ebayCreds.update({
          where: {
            id: creds?.id,
          },
          data: {
            refreshToken: token,
          },
        });
      });
      const res = await ebay.commerce.taxonomy.getCategorySuggestions(
        "15",
        input.title
      );
      // return res.categorySuggestions
      const categoryChoices = res.categorySuggestions.map((category: any) => {
        return {
          label: `${category.category.categoryName} // ${
            category.categoryTreeNodeAncestors.find(
              (x: any) => x.categoryTreeNodeLevel === 1
            ).categoryName
          }`,
          value: category.category.categoryId,
        };
      });
      return categoryChoices;
    }),
  createListing: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        partNo: z.string(),
        condition: z.string(),
        conditionDescription: z.string(),
        images: z.array(z.string()),
        quantity: z.number().default(1),
        listingId: z.string(),
        categoryId: z.string(),
        domesticShipping: z.number(),
        internationalShipping: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("====================INPUT=====================")
      console.log(input)
      console.log("====================INPUT=====================")
      const token = await ctx.prisma.ebayCreds.findFirst();
      ebay.OAuth2.setCredentials(token?.refreshToken as any);
      ebay.OAuth2.on("refreshAuthToken", async (token) => {
        const creds = await ctx.prisma.ebayCreds.findFirst();
        const updatedCreds = await ctx.prisma.ebayCreds.update({
          where: {
            id: creds?.id,
          },
          data: {
            refreshToken: token,
          },
        });
      });
      try {
        console.log("CREATING FULFILLMENT POLICY")
        const createFulfillmentPolicy =
          await ebay.sell.account.createFulfillmentPolicy({
            name: input.listingId,
            marketplaceId: "EBAY_AU" as MarketplaceId,
            categoryTypes: [
              { name: "ALL_EXCLUDING_MOTORS_VEHICLES", default: true },
            ],
            handlingTime: {
              unit: "DAY",
              value: 3,
            },
            // localPickup: true,
            shippingOptions: [
              {
                costType: "FLAT_RATE",
                optionType: "DOMESTIC",
                shippingServices: [
                  {
                    shippingServiceCode: "AU_StandardDelivery",
                    shippingCost: {
                      currency: "AUD",
                      value: input.domesticShipping.toString(),
                    },
                  },
                ],
              },
              {
                costType: "FLAT_RATE",
                optionType: "INTERNATIONAL",
                shippingServices: [
                  {
                    shipToLocations: {
                      regionIncluded: [{ regionName: "Worldwide" }],
                    },
                    shippingCarrierCode: "AustraliaPost",
                    shippingServiceCode: "AU_StandardInternational",
                    shippingCost: {
                      currency: "AUD",
                      value: input.internationalShipping.toString(),
                    },
                  },
                ],
              },
            ],
          } as FulfillmentPolicyRequest);
        console.log("CREATED FULFILLMENT POLICY")
        console.log("=====================================")
        const fulfillmentPolicy = createFulfillmentPolicy.fulfillmentPolicyId;
        console.log("CREATING INVENTORY ITEM")
        const createInventoryItem =
          await ebay.sell.inventory.createOrReplaceInventoryItem(
            input.listingId,
            {
              availability: {
                shipToLocationAvailability: {
                  quantity: input.quantity,
                },
              },
              condition: input.conditionDescription as Condition,
              product: {
                title: input.title,
                description: `${input.description}, ${input.conditionDescription}`,
                aspects: {
                  Brand: ["BMW"],
                },
                mpn: input.partNo,
                brand: "BMW",
                imageUrls: input.images,
              },
            }
          );
        console.log("CREATED INVENTORY ITEM")
        console.log("=====================================")
        console.log("CREATING OFFER")
        const createOffer = await ebay.sell.inventory.createOffer({
          sku: input.listingId,
          marketplaceId: "EBAY_AU" as Marketplace,
          format: "FIXED_PRICE" as FormatType,
          availableQuantity: input.quantity,
          categoryId: input.categoryId, //id of vehicle parts and accs
          listingDescription: input.description,
          listingPolicies: {
            fulfillmentPolicyId: fulfillmentPolicy,
            paymentPolicyId: process.env.EBAY_PAYMENT_ID as string,
            returnPolicyId: process.env.EBAY_RETURN_ID as string,
          },
          merchantLocationKey: process.env.EBAY_MERCHANT_KEY as string,
          pricingSummary: {
            price: {
              currency: "AUD" as CurrencyCode,
              value: input.price.toString(),
            },
          },
        });
        console.log("CREATED OFFER")
        console.log("=====================================")
        console.log("PUBLISHING OFFER")
        const publishOffer = await ebay.sell.inventory.publishOffer(
          createOffer.offerId
        );
        const listing = await ctx.prisma.listing.update({
          where: {
            id: input.listingId,
          },
          data: {
            listedOnEbay: true,
          },
        });
        console.log("PUBLISHED OFFER")
        return {
          publishOffer,
        };
      } catch (err) {
        return {
          err,
        };
      }
    }),
  test: adminProcedure.mutation(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });

    const sellItem = await ebay.commerce.taxonomy.getCategorySuggestions(
      "15",
      "E39 cylinder head cover set"
    );
    return sellItem;
  }),
  getPaymentPolicy: adminProcedure.mutation(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });
    const paymentPolicies = await ebay.sell.account.getPaymentPolicies(
      "EBAY_AU"
    );
    return paymentPolicies.paymentPolicies[0].paymentPolicyId;
  }),
  getReturnPolicy: adminProcedure.mutation(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });
    const returnPolicies = await ebay.sell.account.getReturnPolicies("EBAY_AU");
    return returnPolicies.returnPolicies[0].returnPolicyId;
  }),
  createInventoryLocation: adminProcedure.mutation(async ({ ctx }) => {
    const token = await ctx.prisma.ebayCreds.findFirst();
    ebay.OAuth2.setCredentials(token?.refreshToken as any);
    ebay.OAuth2.on("refreshAuthToken", async (token) => {
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: token,
        },
      });
    });
    const inventoryLocation = await ebay.sell.inventory.getInventoryLocations();
    if (inventoryLocation.total > 0) {
      return inventoryLocation.locations[0].merchantLocationKey;
    }
    const res = await ebay.sell.inventory.createInventoryLocation(
      "parted-euro",
      {
        location: {
          address: {
            addressLine1: "26 Rushdale Street",
            addressLine2: "2",
            city: "Knoxfield",
            country: "AU",
            stateOrProvince: "VIC",
            postalCode: "3180",
          },
        },
        name: "Parted Euro",
        locationWebUrl: "https://www.partedeuro.com.au/",
        locationTypes: ["WAREHOUSE"],
        locationInstructions: "Items ship from here",
        merchantLocationStatus: "ENABLED",
      } as InventoryLocationFull
    );
    const createdLocation = await ebay.sell.inventory.getInventoryLocations();
    return createdLocation.locations[0].merchantLocationKey;
  }),
});
