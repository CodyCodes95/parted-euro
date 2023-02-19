import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const partRouter = router({
  createPartDetail: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        partNo: z.string().min(3),
        cars: z.array(z.string()),
        partTypeId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partDetail.create({
        data: {
          name: input.name,
          partNo: input.partNo,
          partType: {
            connect: {
              id: input.partTypeId,
            },
          },
          cars: {
            connect: input.cars.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
  updatePartDetail: adminProcedure
    .input(
      z.object({
        partNo: z.string().min(3),
        name: z.string().min(3),
        cars: z.array(z.string()),
        partTypeId: z.string(),
      })
  )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partDetail.update({
        where: {
          partNo: input.partNo,
        },
        data: {
          name: input.name,
          partType: {
            connect: {
              id: input.partTypeId,
            },
          },
          cars: {
            connect: input.cars.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
  createPart: adminProcedure
    .input(
      z.object({
        partDetailsId: z.string(),
        donorVin: z.string(),
        inventoryLocationId: z.string(),
        variant: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.create({ data: input });
    }),
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.part.findMany({
      include: {
        partDetails: true,
        donor: {
          include: {
            car: true,
          },
        },
        inventoryLocation: true,
      },
    });
  }),
  deletePart: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.delete({ where: { id: input.id } });
    }),
  // getAllWithCars: publicProcedure.query(async({ ctx }) => {
  //   const parts = await ctx.prisma.part.findMany();
  //   let promises = parts.map((part:any) => {
  //     return ctx.prisma.partsOnCars.findMany({
  //       where: {
  //         partId: part.id
  //       },
  //       include: {
  //         car: true
  //       }
  //     }).then(res => {
  //       part.cars = res.map((r:any) => r.car)
  //     })
  //   })
  //   return Promise.all(promises).then(() => {
  //     return parts
  //   })
  // }
  // )
});
