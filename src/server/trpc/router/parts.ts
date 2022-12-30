import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const partRouter = router({
  createPart: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        partNo: z.string().min(3),
        originVin: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.create({ data: input });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.part.findMany({
      include: {
        origin: true,
      },
    });
  }),
  createCarRelation: publicProcedure
    .input(
      z.array(
        z.object({
          partId: z.string().min(3),
          carId: z.string().min(3),
        })
      )
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partsOnCars.createMany({ data: input });
    }),
  updateListingOnPart: publicProcedure
    .input(
      z.object({
        partId: z.string().min(3),
        listingId: z.string().min(3),
      })
  )
    .mutation(({ ctx, input }) => { 
      return ctx.prisma.part.update({
        where: {
          id: input.partId
        },
        data: {
          listingId: input.listingId,
        },
      });
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
