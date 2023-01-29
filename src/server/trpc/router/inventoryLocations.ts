import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const inventoryLocationRouter = router({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.inventoryLocations.findMany({});
  }),
});
