import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2022-11-15",
});

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
      if (!order) throw new Error("Order not found");
      if (order?.status === "Paid") return;
      const shippingOption = await stripe.shippingRates.retrieve(
        order.shippingRateId!,
      );
      await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: "Paid",
          shippingMethod: shippingOption.display_name,
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
