import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const currentYear: number = new Date().getFullYear();

export const originRouter = router({
  createOrigin: publicProcedure
    .input(
      z.object({
        vin: z.string().min(5),
        cost: z.number().min(100).max(100000000),
        carId: z.string().min(3),
        year: z.number().min(1930).max(currentYear),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.origin.create({ data: input });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany();
  }),
  getAllWithCars: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany({ include: { car: true } });
  }),
});
