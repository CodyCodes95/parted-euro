import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { createInvoice } from "../../xero/createInvoice";
import type Stripe from "stripe";
import {
  sendOrderReadyForPickupEmail,
  sendOrderShippedEmail,
} from "../../resend/resend";

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
        NOT: {
          status: "PENDING",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        FailedOrder: true,
        orderItems: {
          include: {
            listing: {
              include: {
                images: true,
                parts: {
                  include: {
                    inventoryLocation: true,
                    partDetails: true,
                  },
                },
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
        include: {
          order: {
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
          },
        },
      });
      if (!failedOrder) return;
      void createInvoice(
        failedOrder.stripeEvent as unknown as Stripe.Checkout.Session,
        failedOrder.lineItems as any,
      );
    }),
  updateOrder: adminProcedure
    .input(
      z.object({
        id: z.string(),
        trackingNumber: z.string(),
        shippingMethod: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          trackingNumber: input.trackingNumber,
          shippingMethod: input.shippingMethod,
        },
      });
    }),
  sendOrderReadyForPickup: adminProcedure
    .input(
      z.object({
        order: z.object({
          id: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.order.id,
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
      if (!order) return;
      void sendOrderReadyForPickupEmail(order);
      await ctx.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "Ready for pickup",
        },
      });
    }),
  sendOrderShippedEmail: adminProcedure
    .input(
      z.object({
        order: z.object({
          id: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.order.id,
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
          FailedOrder: true,
        },
      });
      if (!order) throw new Error("Order not found");
      void sendOrderShippedEmail(order);
      await ctx.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "Completed",
        },
      });
    }),
});
