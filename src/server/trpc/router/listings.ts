import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import cloudinary from "../../../utils/cloudinary.mjs";

export const listingRouter = router({
  uploadListingImage: publicProcedure
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
  createListing: publicProcedure
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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.listing.findMany();
  }),
});
