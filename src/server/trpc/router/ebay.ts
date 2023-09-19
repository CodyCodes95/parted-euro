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
  getOffer: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
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
      const offers = await ebay.sell.inventory.getOffer(input.id);
      return offers;
    }),
  getOffers: adminProcedure
    .input(
      z.object({
        sku: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
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
        sku: input.sku,
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
        title: z
          .string()
          .max(80, { message: "Title must be less than 80 characters" }),
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
        fulfillmentPolicyId: z.string().optional(),
        partsTable: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("====================INPUT=====================");
      console.log(input);
      console.log("====================INPUT=====================");
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
        const random = Math.floor(100000 + Math.random() * 900000);
        let fulfillmentPolicy;
        if (!input.fulfillmentPolicyId) {
          console.log("CREATING FULFILLMENT POLICY");
          const createFulfillmentPolicy =
            await ebay.sell.account.createFulfillmentPolicy({
              name: `${input.domesticShipping.toString()}-${input.internationalShipping.toString()}`,
              marketplaceId: "EBAY_AU" as MarketplaceId,
              categoryTypes: [
                { name: "ALL_EXCLUDING_MOTORS_VEHICLES", default: true },
              ],
              handlingTime: {
                unit: "DAY",
                value: 3,
              },
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
                  optionType: "DOMESTIC",
                  shippingServices: [
                    {
                      shippingServiceCode: "AU_Pickup",
                      shippingCost: {
                        currency: "AUD",
                        value: 0,
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
          console.log("CREATED FULFILLMENT POLICY");
          console.log("=====================================");
          fulfillmentPolicy = createFulfillmentPolicy.fulfillmentPolicyId;
        } else {
          fulfillmentPolicy = input.fulfillmentPolicyId;
        }
        console.log("CREATING INVENTORY ITEM");
        const createInventoryItem =
          await ebay.sell.inventory.createOrReplaceInventoryItem(
            `${input.listingId} ${random}`,
            {
              availability: {
                shipToLocationAvailability: {
                  quantity: input.quantity,
                },
              },
              condition: input.conditionDescription as Condition,
              product: {
                title: input.title,
                description: input.description,
                aspects: {
                  Brand: ["BMW"],
                },
                mpn: input.partNo,
                brand: "BMW",
                imageUrls: input.images,
              },
            }
          );
        console.log("CREATED INVENTORY ITEM");
        console.log("=====================================");
        console.log("CREATING OFFER");
        const createOffer = await ebay.sell.inventory.createOffer({
          sku: `${input.listingId} ${random}`,
          marketplaceId: "EBAY_AU" as Marketplace,
          format: "FIXED_PRICE" as FormatType,
          availableQuantity: input.quantity,
          categoryId: input.categoryId, //id of vehicle parts and accs
          listingDescription: `<div style="font-family: Arial; display:flex; flex-direction:column"><img style="width:500px" src="https://res.cloudinary.com/dzhmqfmzi/image/upload/v1681223001/Logo_PARTED_EURO_jmszpz.png"/><h3 style="text-decoration: underline;"> Product Description: </h3><p> ${
            input.description
          } </p><h3 style="text-decoration: underline;"> Fitment:</h3>${input.partsTable.replaceAll(
            ",",
            ""
          )}<p> Please note: It is the <b> BUYERS REPSONSIBILITY </b>  to ensure fitment is correct for their vehicle. If you are unsure, feel free to send us a message and we will do our best to assist. </p><p> <b> Refunds will not be issued </b> if the part is not suitable for your car.  </p><h3 style="text-decoration: underline;"> Payment: </h3><p> We only accept PayPal for sales via eBay that are being shipped. For in-store pickup, we can also accept Card (2.5% surcharge) or Cash. Please ensure you have selected the correct delivery method at checkout. </p><h3 style="text-decoration: underline;"> Shipping: </h3><p> Any item(s) purchased will be shipped within <b> 2-3 business days </b> of the sale, once payment has been received. </p><h3 style="text-decoration: underline"> Warranty / Returns: </h3><p> We offer a 30-Day return policy, if an item fails or is not in the expected condition. <b> </p>
<p> Unfortunately due to safety concerns, all items that are airbag / brake / hydraulic related are exempt from this warranty, as we cannot ensure the longevity of these second hand parts. Buy at your own risk. </b> We aim to be as transparent as possible with the condition of second hand parts. </p><p> Refunds will not be issued for change of mind. </p><h3 style="text-decoration: underline;"> About Us: </h3><p> We are a small wrecking business located in Knoxfield, Victoria (Australia). We ship worldwide, or offer in-store pickup. </p><p> If you are chasing something that is not listed on eBay, please feel free to send us a message and we will do our best to assist. </p></div>`,
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
        console.log("CREATED OFFER");
        console.log("=====================================");
        console.log("PUBLISHING OFFER");
        console.log(`CREATED OFFER ID: ${createOffer.offerId}`);
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
        console.log("PUBLISHED OFFER");
        return {
          publishOffer,
        };
      } catch (err) {
        return {
          err,
        };
      }
    }),
  updateQuantity: adminProcedure
    .input(
      z.object({
        sku: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        sku: input.sku,
      });
      // const inventoryItem = await ebay.sell.inventory.getInventoryItem(
      //   input.sku
      // );
      // return inventoryItem;
      // inventoryItem.availability.shipToLocationAvailability.quantity =
      //   input.quantity;

      // delete inventoryItem.packageWeightAndSize;
      // return inventoryItem;
      // const inventory = await ebay.sell.inventory.createOrReplaceInventoryItem(
      //   input.sku,
      //   inventoryItem
      // );
      // return inventory;
      offers.offers[0].availableQuantity = input.quantity;
      return offers.offers[0];
      const res = await ebay.sell.inventory.updateOffer(
        input.sku,
        offers.offers[0]
      );
      return {
        sku: input.sku,
        quantity: input.quantity,
      };
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
  getFulfillmentPolicies: adminProcedure.query(async ({ ctx }) => {
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
    const fulfillmentPolicies = await ebay.sell.account.getFulfillmentPolicies(
      "EBAY_AU"
    );
    return fulfillmentPolicies.fulfillmentPolicies;
  }),
  publishOffer: adminProcedure
    .input(
      z.object({
        offerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
        const publishOffer = await ebay.sell.inventory.publishOffer(
          input.offerId
        );
        return publishOffer;
      } catch (e) {
        console.log(e);
      }
    }),
});
