import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const partRouter = router({
  createPart: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        partNo: z.string().min(3),
        originVin: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.create({ data: input });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.part.findMany();
  }),
  createCarRelation: publicProcedure
    .input(
      z.object({
        carId: z.string().min(3),
        partId: z.string().min(3),
      })
  )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partsOnCars.create({ data: input });
    }),
});
