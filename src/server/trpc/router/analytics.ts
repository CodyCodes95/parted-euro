import { z } from "zod";
import { router, publicProcedure } from "../trpc";
export const analyticsRouter = router({
  listingView: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listingAnalytics.create({
        data: {
          listingId: input.listingId,
        },
      });
    }),
});
