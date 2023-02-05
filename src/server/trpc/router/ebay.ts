import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import eBayApi from "ebay-api";
import {
  FulfillmentPolicyRequest,
} from "ebay-api/lib/types";
import {
  CategoryType,
  Condition,
  ContentLanguage,
  CurrencyCode,
  FormatType,
  Marketplace,
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
  getListings: adminProcedure.query(async ({ ctx }) => {
       const token = await ctx.prisma.ebayCreds.findFirst();
      ebay.OAuth2.setCredentials(token?.refreshToken as any);
      ebay.OAuth2.on("refreshAuthToken", async (token) => {
        const creds = await ctx.prisma.ebayCreds.findFirst();
        const updatedCreds = await ctx.prisma.ebayCreds.update({
          where: {
            id: creds?.id,
          },
          data: {
            refreshToken: JSON.stringify(token),
          },
        });
      });
    const listings = await ebay.sell.inventory.getInventoryItems()
    return listings
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
        listingId: z.string()
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
            refreshToken: JSON.stringify(token),
          },
        });
      });
      try {
        const createInventoryItem =
          await ebay.sell.inventory.createOrReplaceInventoryItem(input.listingId, {
            availability: {
              shipToLocationAvailability: {
                quantity: input.quantity,
              },
            },
            condition: input.condition as Condition,
            product: {
              title: input.title,
              description: input.description,
              aspects: {
                // Brand: ["BMW"],
                // Type: ["Helmet/Action"],
                // "Storage Type": ["Removable"],
                // "Recording Definition": ["High Definition"],
                // "Media Format": ["Flash Drive (SSD)"],
                // "Optical Zoom": ["10x"],
                // "Model": ["Hero4"],
              },
              // brand: "GoPro",
              mpn: input.partNo,
              imageUrls: input.images,
            },
          });
        const createOffer = await ebay.sell.inventory.createOffer({
          // model: "TEST",
          sku: input.listingId,
          marketplaceId: "EBAY_AU" as Marketplace,
          format: "FIXED_PRICE" as FormatType,
          availableQuantity: input.quantity,
          categoryId: "131090", //id of vehicle parts and accs
          listingDescription: input.description,
          listingPolicies: {
            fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_ID as string,
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
          // quantityLimitPerBuyer: 1,
        });
        const publishOffer = await ebay.sell.inventory.publishOffer(
          createOffer.offerId
        );
        // const inventoryLocation =
        //   await ebay.sell.inventory.createInventoryLocation(
        //     "parted-euro-knox",
        //     {
        //       location: {
        //         address: {
        //           addressLine1: "123 fake street",
        //           addressLine2: "2",
        //           city: "Knox",
        //           country: "AU",
        //           stateOrProvince: "VIC",
        //           postalCode: "3152",
        //         },
        //       },
        //       name: "Parted Euro",
        //       locationWebUrl: "https://parted-euro.vercel.app/",
        //       locationTypes: ["WAREHOUSE"],
        //       locationInstructions: "Items ship from here",
        //       merchantLocationStatus: "ENABLED",
        //     } as InventoryLocationFull
        //   );
        // const inventoryLocation =
        // await ebay.sell.inventory.getInventoryLocations();
        // const policies = await ebay.sell.account.getPaymentPolicies("EBAY_AU")
        // const categoryTreeId = await ebay.commerce.taxonomy.getDefaultCategoryTreeId("EBAY_AU") //logged 15, used in req below
        // const sellItem = await ebay.commerce.taxonomy.getCategorySuggestions("15", "GoPro Hero4 Helmet Cam") logged {categoryId: '30093', categoryName: 'Tripods & Monopods'}. Wondering how often
        // this changes? if not often, will just use a generic car parts category for all reqs. If they change, will have to grab on each fetch
        return {
          publishOffer,
        };
      } catch (err) {
        return {
          err,
        };
      }
    }),
});
