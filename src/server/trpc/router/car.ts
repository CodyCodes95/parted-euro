import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const carRouter = router({
  createCar: publicProcedure.input(z.object({
    make: z.string().min(3),
    series: z.string().min(3),
    generation: z.string().min(3),
    model: z.string().min(3)
  }))
    .mutation(({ctx, input }) => {
      return ctx.prisma.car.create({data: input})
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.car.findMany();
  })
});

// export const carRouter = router({
//   hello: publicProcedure
//     .input(z.object({ text: z.string().nullish() }).nullish())
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input?.text ?? "world"}`,
//       };
//     }),
//   getAll: publicProcedure.query(({ ctx }) => {
//     return ctx.prisma.example.findMany();
//   }),
// });
