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
      if (ctx.session?.user) return;
      return ctx.prisma.listingAnalytics.create({
        data: {
          listingId: input.listingId,
        },
      });
    }),
});
