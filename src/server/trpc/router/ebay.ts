import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import eBayApi from "ebay-api";

export const ebayRouter = router({
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
    const ebay = eBayApi.fromEnv();
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
      const ebay = eBayApi.fromEnv();
      const token = await ebay.OAuth2.getToken(input.code);
      const creds = await ctx.prisma.ebayCreds.findFirst();
      const updatedCreds = await ctx.prisma.ebayCreds.update({
        where: {
          id: creds?.id,
        },
        data: {
          refreshToken: JSON.stringify(token),
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
      const ebay = eBayApi.fromEnv();
      ebay.OAuth2.setCredentials(JSON.parse(token?.refreshToken as any));
      const orders = await ebay.sell.fulfillment.getOrders();
      console.log(orders)
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
