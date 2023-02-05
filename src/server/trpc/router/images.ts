import { adminProcedure } from './../trpc';
import { z } from "zod";
import { router } from "../trpc";
import cloudinary from "../../../utils/cloudinary.mjs";

export const imagesRouter = router({
  uploadListingImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const uploadedImage = cloudinary.uploader
        .upload(input.image, {
          folder: "listings",
          // width: 300,
          // crop: "scale",
        })
        .then((res) => {
          return res;
        });
    }),
  createImageRecord: adminProcedure
    .input(
      z.object({
        url: z.string().min(3),
        listingId: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.image.create({ data: input });
    }),
  createImageDonorRecord: adminProcedure
    .input(
      z.object({
        url: z.string().min(3),
        donorVin: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.image.create({ data: input });
    }),
});
