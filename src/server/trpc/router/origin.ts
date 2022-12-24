import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const originRouter = router({
  createOrigin: publicProcedure
    .input(
      z.object({
        vin: z.string().min(5),
        cost: z.number(),
        carId: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.origin.create({ data: input });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany();
  }),
});