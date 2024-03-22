import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const orderItemsRouter = router({
  updateOrderItems: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
      });
      if (order?.status === "Paid") return;
      await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: "Paid",
        },
      });
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          orderId: input.orderId,
        },
        include: {
          listing: true,
        },
      });
      for (const item of orderItems) {
        const listing = item.listing.id;
        const listingItems = await ctx.prisma.listing.findUnique({
          where: {
            id: listing,
          },
          include: {
            parts: true,
          },
        });
        for (const part of listingItems!.parts) {
          await ctx.prisma.listing.update({
            where: {
              id: listing,
            },
            data: {
              parts: {
                update: {
                  where: {
                    id: part.id,
                  },
                  data: {
                    quantity: part.quantity - item.quantity,
                  },
                },
              },
            },
          });
        }
      }
    }),
});
