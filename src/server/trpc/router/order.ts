import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

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
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.order.create({
        data: {
          items: {
            connect: input.items.map((id) => {
              return { id };
            }),
          },
          shippingMethod: input.shippingMethod,
          subtotal: input.subtotal,
          shipping: input.shipping,
          name: input.name,
          email: input.email,
          shippingAddress: input.shippingAddress,
        },
      });
    }),
});
