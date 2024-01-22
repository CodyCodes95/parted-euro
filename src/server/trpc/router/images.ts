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
        order: z.number(),
      }),
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
          order: input.order,
        },
      });
    }),
  uploadDonorImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
        donorVin: z.string(),
        order: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await cloudinary.uploader.upload(input.image, {
        folder: "donors",
      });
      const image = await ctx.prisma.image.create({
        data: {
          url: res.url,
          donorVin: input.donorVin,
          order: input.order,
        },
      });
      await ctx.prisma.donor.update({
        where: {
          vin: input.donorVin,
        },
        data: {
          images: {
            connect: {
              id: image.id,
            },
          },
        },
      });
      return;
    }),
  updateImageOrder: adminProcedure
    .input(
      z.object({
        id: z.string(),
        order: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.image.update({
        where: {
          id: input.id,
        },
        data: {
          order: input.order,
        },
      });
    }),
  deleteImage: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.image.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
