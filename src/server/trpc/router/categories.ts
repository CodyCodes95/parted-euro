import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const categoryRouter = router({
  getAllCategories: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.partTypeParentCategory.findMany({});
  }),
  getAllSubCategories: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.partTypes.findMany({
      include: {
        parentCategory: true,
      },
    });
  }),
  createSubCategory: adminProcedure
    .input(
      z.object({
        name: z.string(),
        parentCategoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.partTypes.create({
        data: {
          name: input.name,
          parentCategory: {
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
      })
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
    }
  ),
});
