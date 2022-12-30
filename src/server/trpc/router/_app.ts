import { originRouter } from './origin';
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { exampleRouter } from "./example";
import { listingRouter } from './listings';
import { partRouter } from './parts';
import { imagesRouter } from './images';

export const appRouter = router({
  example: exampleRouter,
  cars: carRouter,
  origins: originRouter,
  listings: listingRouter,
  parts: partRouter,
  images: imagesRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
