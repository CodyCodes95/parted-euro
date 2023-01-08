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
        parts: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listing.create({
        data: {
          title: input.title,
          description: input.description,
          condition: input.condition,
          price: input.price,
          weight: input.weight,
          length: input.length,
          width: input.width,
          height: input.height,
          parts: {
            connect: input.parts.map((part) => {
              return { id: part };
            }),
          },
        },
      });
    }),
  getAllAvailable: publicProcedure
    .input(
      z.object({
        generation: z.string().optional(),
        model: z.string().optional(),
        series: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.generation || !input.model || !input.series) {
      const listings = await ctx.prisma.listing.findMany({
        include: {
          images: true,
          parts: true,
        },
        where: {
          title: {
            contains: input.search || "",
          },
          active: true,
          // active: true,
        },
      });
        return listings;
      } else {
        const listings = await ctx.prisma.listing.findMany({
          // Only return listings where any cars attached to any of the parts attached to the listing
          // match the generation, model, and series
          include: {
            images: true,
            parts: true
          },
          where: {
            title: {
              contains: input.search || "",
            },
            active: true,
            parts: {
              some: {
                partDetails: {
                  cars: {
                    some: {
                      generation: input.generation,
                      model: input.model,
                      series: input.series,
                    },
                  },
                },
              },
            },
          },
        })
        return listings
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
                      model: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
});
