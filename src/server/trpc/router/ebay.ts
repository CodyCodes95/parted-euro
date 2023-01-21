import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import ebayAuthToken from "../../../utils/ebay.mjs";

export const ebayRouter = router({
    authenticate: adminProcedure.mutation(async ({ ctx }) => {
        const authUrl = ebayAuthToken.generateUserAuthorizationUrl(
          "PRODUCTION",
          process.env.EBAY_SCOPES?.split(" "),
        );
        return {
            url: authUrl,
        }
    })
});
