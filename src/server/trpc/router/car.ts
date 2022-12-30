import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

export const carRouter = router({
  createCar: publicProcedure.input(z.object({
    make: z.string().min(2),
    series: z.string().min(2),
    generation: z.string().min(2),
    model: z.string().min(2)
  }))
    .mutation(({ctx, input }) => {
      return ctx.prisma.car.create({data: input})
    }),
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.car.findMany();
  })
});