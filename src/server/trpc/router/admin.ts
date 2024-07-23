import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  adminSearch: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return;
  }),
});
