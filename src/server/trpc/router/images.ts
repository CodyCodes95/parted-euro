import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { router, publicProcedure } from "../trpc";
import cloudinary from "../../../utils/cloudinary.mjs";

export const imagesRouter = router({
  uploadListingImage: publicProcedure
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
  createImageRelation: publicProcedure
    .input(
      z.object({
        url: z.string().min(3),
        listingId: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.images.create({ data: input });
    }),
});
