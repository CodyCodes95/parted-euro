import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const carRouter = router({
  createCar: publicProcedure.input(z.object({
    make: z.string().min(2),
    series: z.string().min(2),
    generation: z.string().min(2),
    model: z.string()
  }))
    .mutation(({ctx, input }) => {
      return ctx.prisma.car.create({data: input})
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.car.findMany();
  })
});