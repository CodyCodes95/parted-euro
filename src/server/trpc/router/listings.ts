import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
// import eBayApi from "ebay-api";
import cloudinary from "../../../utils/cloudinary.mjs";

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
        generation: z.string().min(3).optional(),
        model: z.string().min(3).optional(),
        series: z.string().min(3).optional(),
      })
    )
    .query(({ ctx }) => {
      return ctx.prisma.listing.findMany({
        include: {
          Images: true,
        },
        where: {
          sold: false,
        },
      });
    }),
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
          Images: true,
          parts: {
            select: {
              partNo: true,
              origin: {
                select: {
                  vin: true,
                  year: true,
                  car: true,
                }
              },
              cars: {
                select: {
                  car: true
                },
              },
            },
          }
        }
        // include: {
        //   Images: true,
        //   parts: true,
        // },
      });
    }),
});
