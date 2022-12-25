import { originRouter } from './origin';
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { exampleRouter } from "./example";
import { listingRouter } from './listings';

export const appRouter = router({
  example: exampleRouter,
  cars: carRouter,
  origins: originRouter,
  listings: listingRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
