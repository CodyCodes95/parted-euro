import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const currentYear: number = new Date().getFullYear();

export const originRouter = router({
  createOrigin: adminProcedure
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
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany();
  }),
  getAllWithCars: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany({ include: { car: true } });
  }),
  getAllDashboard: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.origin.findMany({
      select: {
        vin: true,
        year: true,
        car: {
          select: {
            series: true,
            generation: true,
            model: true,
          },
        },
        cost: true,
        Part: {
          select: {
            listing: {
              select: {
                price: true,
                sold: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });
  })
});