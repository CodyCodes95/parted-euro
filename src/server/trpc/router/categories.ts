import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../trpc";

export const categoryRouter = router({
  getParentCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.partTypes.findMany({
      where: {
        parent: null,
      },
    });
  }),
  getAllSubCategories: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.partTypes.findMany({
      where: {
        parent: {
          NOT: undefined,
        },
      },
      include: {
        parent: true,
      },
    });
  }),
  getSubCategoriesByParent: publicProcedure
    .input(
      z.object({
        parentCategoryId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.partTypes.findMany({
        where: {
          parent: {
            name: input.parentCategoryId,
          },
        },
      });
    }),
  createSubCategory: adminProcedure
    .input(
      z.object({
        name: z.string(),
        parentCategoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.partTypes.create({
        data: {
          name: input.name,
          parent: {
            connect: {
              id: input.parentCategoryId,
            },
          },
        },
      });
    }),
  editSubCategory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.partTypes.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
});
