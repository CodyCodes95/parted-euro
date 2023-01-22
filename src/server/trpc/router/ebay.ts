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
    }),
    getAccessToken: adminProcedure.input(z.object({
        code: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const accessToken = await ebayAuthToken.exchangeCodeForAccessToken(
          "PRODUCTION",
          input.code
        );
        console.log(accessToken);
        return {
            accessToken
        }
    })
});
