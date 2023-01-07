import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const partDetailsRouter = router({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.partDetail.findMany({
    });
  }),
});
