import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import eBayApi from "ebay-api";
import {
  FulfillmentPolicyRequest,
  EbayOfferDetailsWithKeys,
  InventoryLocationFull,
} from "ebay-api/lib/types";
import {
  CategoryType,
  MarketplaceId,
  RegionType,
  TimeDurationUnit,
} from "ebay-api/lib/enums";
import { RegionSet } from "ebay-api/lib/types";
import { Region } from "ebay-api/lib/types";
import { SellInventoryItem } from "ebay-api/lib/types";

const ebay = eBayApi.fromEnv();
ebay.config.acceptLanguage = "en-AU";
ebay.config.contentLanguage = "en-AU" as any;
ebay.config.marketplaceId = "EBAY_AU" as any;

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
  createListing: adminProcedure
    .input(
      z.object({
        title: z.string(),
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
      const listing = {
        model: "TEST",
        sku: "124158001",
        marketplaceId: "EBAY_AU",
        format: "FIXED_PRICE",
        availableQuantity: 1,
        categoryId: "30093",
        listingDescription: "Brand new red bikeeeeeeeee",
        listingPolicies: {
          fulfillmentPolicyId: "42821376015",
          paymentPolicyId: "42821372015",
          returnPolicyId: "205483749015",
        },
        merchantLocationKey: "parted-euro-knox",
        pricingSummary: {
          price: {
            currency: "AUD",
            value: "1005.00",
          },
        },
        quantityLimitPerBuyer: 1,
        includeCatalogProductDetails: true,
      } as EbayOfferDetailsWithKeys;
      // const fulfillmentPolicy = await ebay.sell.account.createFulfillmentPolicy(
      //   {
      //     name: "Fulfilmnet Policy",
      //     description: "Fulfilmnet Policy",
      //     marketplaceId: MarketplaceId.EBAY_AU,
      //     handlingTime: {
      //       unit: TimeDurationUnit.DAY,
      //       value: 1,
      //     },
      //     categoryTypes: [CategoryType.ALL_EXCLUDING_MOTORS_VEHICLES] as any[],
      //     shipToLocations: {
      //       regionIncluded: [RegionType.WORLDWIDE] as any[],
      //       regionExcluded: [] as any[],
      //     },
      //   }
      // );
      try {
        // const sellItem = await ebay.sell.inventory.createOffer(listing);
        // const fulfillmentPolicy = await ebay.sell.fulfillment.getOrders();
        // const sellItem = await ebay.sell.inventory.getInventoryItems()
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
        // const sellItem = await ebay.sell.account.getPaymentPolicies("EBAY_AU")
        // const categoryTreeId = await ebay.commerce.taxonomy.getDefaultCategoryTreeId("EBAY_AU") //logged 15, used in req below
        // const sellItem = await ebay.commerce.taxonomy.getCategorySuggestions("15", "GoPro Hero4 Helmet Cam") logged {categoryId: '30093', categoryName: 'Tripods & Monopods'}. Wondering how often
        // this changes? if not often, will just use a generic car parts category for all reqs. If they change, will have to grab on each fetch
        // const sellItem = await ebay.sell.inventory.createOrReplaceInventoryItem(
        //   "124158001",
        //   {
        //     availability: {
        //       shipToLocationAvailability: {
        //         quantity: 10,
        //       },
        //     },
        //     condition: "NEW",
        //     product: {
        //       title: "GoPro Hero4 Helmet Cam",
        //       description: "New GoPro Hero4 Helmet Cam. Unopened box.",
        //       aspects: {
        //         Brand: ["GoPro"],
        //         Type: ["Helmet/Action"],
        //         "Storage Type": ["Removable"],
        //         "Recording Definition": ["High Definition"],
        //         "Media Format": ["Flash Drive (SSD)"],
        //         "Optical Zoom": ["10x"],
        //         "Model": ["Hero4"],
        //       },
        //       brand: "GoPro",
        //       mpn: "CHDHX-401",
        //       imageUrls: [
        //         "https://res.cloudinary.com/codycodes/image/upload/v1673508756/listings/Photo20-12-2022_60517pm_ozi5cs.webp",
        //       ],
        //     },
        //   } as SellInventoryItem
        // );
        // const sellItem = await ebay.sell.inventory.getInventoryItems();
        // const fulfillmentPolicy =
        // await ebay.sell.account.createFulfillmentPolicy(request);
        // const offers = await ebay.sell.inventory.getOffers({
        //   sku: "12345543219922222",
        //   marketplaceId: "EBAY_AU",
        // });
        const publishOffer = await ebay.sell.inventory.publishOffer(
          "296734126016"
        );
        return {
          // sellItem,
          // offers,
          publishOffer,
          // inventoryLocation,
        };
      } catch (err) {
        return {
          err,
        };
      }
      // const ebayCreds = await ctx.prisma.ebayCreds.findFirst();
      // const ebayTokenRes = await ebayAuthToken.getAccessToken(
      //   "PRODUCTION",
      //   ebayCreds?.refreshToken,
      //   process.env.EBAY_SCOPES?.split(" ")
      // );
      // const tokenSet = JSON.parse(ebayTokenRes as any);
      // create the listing::::
      // const res = await fetch(
      //   `https://api.ebay.com/sell/inventory/v1/inventory_item/11121702856`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       Authorization: `Bearer ${tokenSet.access_token}`,
      //       "Content-Type": "application/json",
      //       "Content-Language": "en-US",
      //     },
      //     body: JSON.stringify({
      //       availability: {
      //         shipToLocationAvailability: {
      //           quantity: 50,
      //         },
      //       },
      //       condition: "NEW",
      //       product: {
      //         title: "GoPro Hero4 Helmet Cam",
      //         description: "New GoPro Hero4 Helmet Cam. Unopened box.",
      //         aspects: {
      //           Brand: ["GoPro"],
      //           Type: ["Helmet/Action"],
      //           "Storage Type": ["Removable"],
      //           "Recording Definition": ["High Definition"],
      //           "Media Format": ["Flash Drive (SSD)"],
      //           "Optical Zoom": ["10x"],
      //         },
      //         brand: "GoPro",
      //         mpn: "CHDHX-401",
      //         imageUrls: [
      //           "https://res.cloudinary.com/codycodes/image/upload/v1673508756/listings/Photo20-12-2022_60517pm_ozi5cs.webp",
      //         ],
      //       },
      //     }),
      //   }
      // );
      // const res = await fetch(
      //   `https://api.ebay.com/sell/inventory/v1/inventory_item?limit=10&offset=0`,
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${tokenSet.access_token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      // const res = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${tokenSet.access_token}`,
      //     "Content-Type": "application/json",
      //     "Content-Language": "en-US",
      //   },
      //   body: JSON.stringify({
      //     sku: "11121702856",
      //     marketplaceId: "EBAY_AU",
      //     format: "FIXED_PRICE",
      //     availableQuantity: 5,
      //     categoryId: "30120",
      //     listingDescription:
      //       "Go pro with great camera great condition and great price",
      //     listingPolicies: {
      //       fulfillmentPolicyId: "3*********0",
      //       paymentPolicyId: "3*********0",
      //       returnPolicyId: "3*********0",
      //     },
      //     pricingSummary: {
      //       price: {
      //         currency: "AUD",
      //         value: "15.75",
      //       },
      //     },
      //     quantityLimitPerBuyer: 2,
      //     includeCatalogProductDetails: true,
      //   }),
      // });
      // const res = await fetch(
      //   "https://api.ebay.com/sell/account/v1/fulfillment_policy",
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer ${tokenSet.access_token}`,
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       categoryTypes: [
      //         {
      //           name: "ALL_EXCLUDING_MOTORS_VEHICLES",
      //         },
      //       ],
      //       marketplaceId: "EBAY_AU",
      //       name: "partedeuro",
      //       handlingTime: {
      //         unit: "DAY",
      //         value: "1",
      //       },
      //       shippingOptions: [
      //         {
      //           costType: "FLAT_RATE",
      //           optionType: "DOMESTIC",
      //           shippingServices: [
      //             {
      //               buyerResponsibleForShipping: "false",
      //               freeShipping: "true",
      //               shippingCarrierCode: "USPS",
      //               shippingServiceCode: "USPSPriorityFlatRateBox",
      //             },
      //           ],
      //         },
      //       ],
      //     }),
      //   }
      // );
      // const data = await res.json();
      // console.log(data);
      // return {
      //   data,
      // };
    }),
});
