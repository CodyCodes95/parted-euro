import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { createInvoice } from "../../xero/createInvoice";
import Stripe from "stripe";

export const orderRouter = router({
  createOrder: adminProcedure
    .input(
      z.object({
        items: z.array(z.string()),
        shippingMethod: z.string(),
        subtotal: z.number(),
        shipping: z.number(),
        name: z.string(),
        email: z.string().email(),
        shippingAddress: z.string().optional(),
        xero: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.order.create({
        data: {
          orderItems: {
            connect: input.items.map((id) => {
              return { id };
            }),
          },
          shipping: input.shipping,
          shippingMethod: input.shippingMethod,
          status: "Paid",
          subtotal: input.subtotal,
          name: input.name,
          email: input.email,
          shippingAddress: input.shippingAddress,
        },
      });
    }),
  getOrder: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.order.findUnique({
        where: {
          id: input.id,
        },
        include: {
          orderItems: {
            include: {
              listing: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });
    }),
  getAllAdmin: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.order.findMany({
      where: {
        status: "Paid",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: {
          include: {
            listing: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }),
  regenerateInvoice: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const failedOrder = await ctx.prisma.failedOrder.findUnique({
        where: {
          orderId: input.id,
        },
      });
      if (!failedOrder) return;
      createInvoice(failedOrder.stripeEvent, failedOrder.lineItems as any);
    }),
});
