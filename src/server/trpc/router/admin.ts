import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  adminSearchCounts: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const listingsRequest = ctx.prisma.listing.count({
        where: {
          OR: [
            {
              title: {
                contains: input,
                mode: "insensitive",
              },
              parts: {
                some: {
                  partDetails: {
                    partNo: {
                      contains: input,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        },
      });
      const carsRequest = ctx.prisma.car.count({
        where: {
          model: {
            contains: input,
            mode: "insensitive",
          },
        },
      });
      const inventoryRequest = ctx.prisma.part.count({
        where: {
          OR: [
            {
              partDetails: {
                partNo: {
                  contains: input,
                  mode: "insensitive",
                },
              },
            },
            {
              partDetails: {
                name: {
                  contains: input,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
      });
      const [listings, cars, inventory] = await Promise.all([
        listingsRequest,
        carsRequest,
        inventoryRequest,
      ]);
      return {
        listings,
        cars,
        inventory,
      };
    }),
  adminSearchListings: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        where: {
          OR: [
            {
              title: {
                contains: input,
                mode: "insensitive",
              },
              parts: {
                some: {
                  partDetails: {
                    partNo: {
                      contains: input,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        },
      });
      return listings;
    }),
});
