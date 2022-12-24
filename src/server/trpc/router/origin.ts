import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const originRouter = router({
  createOrigin: publicProcedure
    .input(
      z.object({
        vin: z.string(),
        cost: z.number(),
        carId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.origin.create({ data: input });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.car.findMany();
  }),
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
