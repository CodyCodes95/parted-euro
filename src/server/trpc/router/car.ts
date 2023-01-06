import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

export const carRouter = router({
  createCar: adminProcedure.input(z.object({
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
  }),
  getAllUniqueFields: publicProcedure.query(async ({ ctx }) => {
    const cars = await ctx.prisma.car.findMany({
      select: {
        model: true,
        generation: true,
        series: true,
      }
    });
    const models = cars.map((car) => car.model);
    const uniqueModels = [...new Set(models)];
    const generations = cars.map((car) => car.generation);
    const uniqueGenerations = [...new Set(generations)].sort()
    const series = cars.map((car) => car.series).sort()
    const uniqueSeries = [...new Set(series)].sort()
    return {
      models: uniqueModels,
      generations: uniqueGenerations,
      series: uniqueSeries
    }
  })
});