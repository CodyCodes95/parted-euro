import { donorRouter } from "./donors";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { exampleRouter } from "./example";
import { listingRouter } from "./listings";
import { partRouter } from "./parts";
import { imagesRouter } from "./images";
import { partDetailsRouter } from "./partDetails";

export const appRouter = router({
  example: exampleRouter,
  cars: carRouter,
  donors: donorRouter,
  listings: listingRouter,
  parts: partRouter,
  images: imagesRouter,
  auth: authRouter,
  partDetails: partDetailsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
