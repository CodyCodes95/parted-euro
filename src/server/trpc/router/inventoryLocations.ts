import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const inventoryLocationsRouter = router({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.inventoryLocations.findMany({});
  }),
  getAllLocations: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.inventoryLocations.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            parts: true,
          },
        },
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

  mergeLocations: adminProcedure
    .input(
      z.object({
        sourceId: z.string(),
        targetId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First update all parts to the new location
      await ctx.prisma.part.updateMany({
        where: {
          inventoryLocationId: input.sourceId,
        },
        data: {
          inventoryLocationId: input.targetId,
        },
      });

      // Then delete the source location
      return ctx.prisma.inventoryLocations.delete({
        where: {
          id: input.sourceId,
        },
      });
    }),
});
