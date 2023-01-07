import { adminProcedure } from "../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const currentYear: number = new Date().getFullYear();

export const donorRouter = router({
  createDonor: adminProcedure
    .input(
      z.object({
        vin: z.string().min(5),
        cost: z.number().min(100).max(100000000),
        carId: z.string().min(3),
        year: z.number().min(1930).max(currentYear),
        mileage: z.number().min(0).max(100000000),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.donor.create({ data: input });
    }),
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany();
  }),
  getAllWithCars: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({ include: { car: true } });
  }),
  getAllDashboard: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({
      select: {
        vin: true,
        year: true,
        mileage: true,
        car: {
          select: {
            series: true,
            generation: true,
            model: true,
          },
        },
        cost: true,
        parts: {
          select: {
            listing: {
              select: {
                price: true,
                active: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });
  }),
});
