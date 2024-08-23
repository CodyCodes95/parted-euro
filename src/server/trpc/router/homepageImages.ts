import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import cloudinary from "../../../utils/cloudinary.mjs";

export const homepageImagesRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.homepageImage.findMany({
      orderBy: { order: 'asc' },
    });
  }),

  upload: adminProcedure
    .input(z.object({ image: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const uploadedImage = await cloudinary.uploader.upload(input.image, {
        folder: "homepage",
      });

      const lastImage = await ctx.prisma.homepageImage.findFirst({
        orderBy: { order: 'desc' },
      });

      const newOrder = lastImage ? lastImage.order + 1 : 0;

      return ctx.prisma.homepageImage.create({
        data: {
          url: uploadedImage.url,
          order: newOrder,
        },
      });
    }),

  updateOrder: adminProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      const updatePromises = input.map((item) =>
        ctx.prisma.homepageImage.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      );

      await Promise.all(updatePromises);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.homepageImage.delete({
        where: { id: input.id },
      });

      // Delete image from Cloudinary
      const publicId = image.url.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`homepage/${publicId}`);
      }

      // Update order of remaining images
      await ctx.prisma.homepageImage.updateMany({
        where: { order: { gt: image.order } },
        data: { order: { decrement: 1 } },
      });
    }),
});