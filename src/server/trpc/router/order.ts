import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

export const orderRouter = router({
  getOrder: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.order.findUnique({
      where: {
        id: input,
      },
      include: {
        items: {
          include: {
            images: true,
          },
        },
      },
    });
  }),
});
