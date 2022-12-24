import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  cars: carRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
