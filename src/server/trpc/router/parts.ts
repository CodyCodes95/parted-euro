import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const partRouter = router({
  createPartDetail: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        partNo: z.string().min(3),
        cars: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partDetail.create({
        data: {
          name: input.name,
          partNo: input.partNo,
          cars: {
            connect: input.cars.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
  
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.part.findMany({
      include: {
        donor: true,
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
