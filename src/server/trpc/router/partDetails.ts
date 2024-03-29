import { publicProcedure } from "./../trpc";
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const partDetailsRouter = router({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.partDetail.findMany({
      include: {
        partTypes: {
          include: {
            parent: true,
          },
        },
        parts: true,
        cars: true,
      },
    });
  }),
  getAllPartTypes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.partTypes.findMany({
      where: {
        parent: {
          isNot: null,
        },
      },
      include: {
        parent: true,
      },
    });
  }),
  deletePartDetail: adminProcedure
    .input(
      z.object({
        partNo: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.partDetail.delete({
        where: {
          partNo: input.partNo,
        },
      });
    }),
});
