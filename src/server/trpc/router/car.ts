import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

export const carRouter = router({
  createCar: adminProcedure
    .input(
      z.object({
        make: z.string().min(2),
        series: z.string().min(2),
        generation: z.string().min(2),
        model: z.string().min(2),
        body: z.string().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.car.create({ data: input });
    }),
  getAllSearch: adminProcedure.input(z.object(
    { search: z.string() }
  )).query(({ ctx, input }) => {
    return ctx.prisma.car.findMany({
      where: {
        OR: [
          { model: { contains: input.search } },
          { generation: { contains: input.search } },
          { series: { contains: input.search } },
        ],
      },
    });
  }),
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.car.findMany();
  }),
  // getAllSearch: 
  getAllSeries: publicProcedure.query(async ({ ctx }) => {
    const cars = await ctx.prisma.car.findMany({
      where: {
        make: "BMW",
      },
      select: {
        series: true,
      },
    });
    const series = cars.map((car) => car.series).sort();
    const uniqueSeries = [...new Set(series)].sort().map((series) => {
      return {
        label: series,
        value: series,
      };
    });
    return {
      series: uniqueSeries,
    };
  }),
  getMatchingGenerations: publicProcedure
    .input(
      z.object({
        series: z.string().min(2),
      })
    )
    .query(async ({ ctx, input }) => {
      const cars = await ctx.prisma.car.findMany({
        where: {
          series: input.series,
        },
      });
      const generations = cars.map((car) => car.generation).sort();
      const uniqueGenerations = [...new Set(generations)]
        .sort()
        .map((generation) => {
          return {
            label: generation,
            value: generation,
          };
        });
      return {
        generations: uniqueGenerations,
      };
    }),
  getMatchingModels: publicProcedure
    .input(
      z.object({
        series: z.string().min(2),
        generation: z.string().min(2),
      })
    )
    .query(async ({ ctx, input }) => {
      const cars = await ctx.prisma.car.findMany({
        where: {
          series: input.series,
          generation: input.generation,
        },
      });
      const models = cars.map((car) => car.model).sort();
      const uniqueModels = [...new Set(models)].sort().map((model) => {
        return {
          label: model,
          value: model,
        };
      });
      return {
        models: uniqueModels,
      };
    }),
  deleteCar: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.car.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
