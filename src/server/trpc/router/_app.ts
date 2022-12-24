import { originRouter } from './origin';
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  cars: carRouter,
  origins: originRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
