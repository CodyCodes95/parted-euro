import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
// import eBayApi from "ebay-api";
import cloudinary from "../../../utils/cloudinary.mjs";
import { input } from "@material-tailwind/react";

export const listingRouter = router({
  uploadListingImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const uploadedImage = cloudinary.uploader.upload(input.image, {
        folder: "listings",
        // width: 300,
        // crop: "scale",
      });
      return uploadedImage;
    }),
  createListing: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        condition: z.string().min(3),
        price: z.number().min(100).max(100000000),
        weight: z.number(),
        length: z.number(),
        width: z.number(),
        height: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listing.create({ data: input });
    }),
  getAllAvailable: publicProcedure
    .input(
      z.object({
        generation: z.string().optional(),
        model: z.string().optional(),
        series: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        include: {
          images: true,
          parts: true,
        },
        where: {
          active: false,
          // active: true,
        },
      });
      if (!input.generation || !input.model || !input.series) {
        return listings;
      } else {
        // const filteredListings = listings.filter((listing: typeof listings[0]) => {
        //   return (
        //     listing.parts.
        //     // listing.car.generation === input.generation &&
        //     // listing.car.model === input.model &&
        //     // listing.car.series === input.series
        //   );
        // });
        // return filteredListings;
        console.log("err");
        return [];
      }
    }),
  // This getallavailable is one that works. I am going to do some manual filtering after
  // prisma fetch to only return matching listings for generation, model, and series
  // Ideally, this would all be done with one prisma query, but I am not sure how to do that
  // getAllAvailable: publicProcedure
  //   .input(
  //     z.object({
  //       generation: z.string().min(3).optional(),
  //       model: z.string().min(3).optional(),
  //       series: z.string().min(3).optional(),
  //     })
  //   )
  //   .query(({ ctx }) => {
  //     return ctx.prisma.listing.findMany({
  //       include: {
  //         Images: true,
  //       },
  //       where: {
  //         sold: false,
  //       },
  //     });
  //   }),
  getListing: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        select: {
          title: true,
          description: true,
          condition: true,
          price: true,
          weight: true,
          length: true,
          width: true,
          height: true,
          images: true,
          parts: {
            select: {
                 donor: {
                select: {
                  vin: true,
                  year: true,
                  car: true,
                  mileage: true,
                },
              },
              partDetails: {
                select: {
                  partNo: true,
                  cars: {
                    select: {
                      id: true,
                      generation: true,
                      model: true
                    }
                  }
                }
              }
            },
          },
        },

      });
    }),
});
