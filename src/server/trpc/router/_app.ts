import { donorRouter } from "./donors";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { listingRouter } from "./listings";
import { partRouter } from "./parts";
import { imagesRouter } from "./images";
import { partDetailsRouter } from "./partDetails";
import { xeroRouter } from "./xero";
import { ebayRouter } from "./ebay";
import { inventoryLocationRouter } from "./inventoryLocations";
import { categoryRouter } from "./categories";

export const appRouter = router({
  cars: carRouter,
  donors: donorRouter,
  listings: listingRouter,
  parts: partRouter,
  images: imagesRouter,
  auth: authRouter,
  partDetails: partDetailsRouter,
  xero: xeroRouter,
  ebay: ebayRouter,
  inventoryLocations: inventoryLocationRouter,
  categories: categoryRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
