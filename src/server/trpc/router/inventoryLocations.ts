import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const inventoryLocationsRouter = router({
  getAllLocations: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.inventoryLocations.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  createLocation: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.inventoryLocations.create({
        data: {
          name: input.name,
        },
      });
    }),

  updateLocation: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.inventoryLocations.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  deleteLocation: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.inventoryLocations.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
