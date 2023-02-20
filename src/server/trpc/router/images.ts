import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router } from "../trpc";
import cloudinary from "../../../utils/cloudinary.mjs";

export const imagesRouter = router({
  uploadListingImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const uploadedImage = await cloudinary.uploader.upload(input.image, {
        folder: "listings",
        // width: 300,
        // crop: "scale",
      });
      return ctx.prisma.image.create({
        data: {
          url: uploadedImage.url,
          listingId: input.listingId,
        },
      });
    }),
  uploadDonorImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
        donorVin: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const uploadedImage = cloudinary.uploader
        .upload(input.image, {
          folder: "donors",
        })
        .then((res) => {
          return ctx.prisma.image.create({
            data: {
              url: res.url,
              listingId: input.donorVin,
            },
          });
        });
    }),
});
