import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.isAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be an admin to view users",
      });
    }

    return await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        image: true,
      },
    });
  }),

  toggleAdmin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        isAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be an admin to modify user permissions",
        });
      }

      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          isAdmin: input.isAdmin,
        },
      });
    }),
});
