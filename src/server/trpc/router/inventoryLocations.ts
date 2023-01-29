import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const inventoryLocationRouter = router({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.inventoryLocations.findMany({});
  }),
  createInventoryLocation: adminProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventoryLocations.create({
        data: {
          name: input.name,
        },
      });
    }),
});
