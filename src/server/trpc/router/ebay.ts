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
    updateRefreshToken: adminProcedure.input(z.object({
        code: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const tokenSet = await ebayAuthToken.exchangeCodeForAccessToken(
          "PRODUCTION",
          input.code
        );
        console.log(tokenSet.refresh_token as any)
          const creds = await ctx.prisma.ebayCreds.findFirst();
          const updatedCreds = await ctx.prisma.ebayCreds.update({
            where: {
              id: creds?.id,
            },
            data: {
              refreshToken: tokenSet.refresh_token,
            },
          });
          return {
            updatedCreds,
          };
    }),
    createListing: adminProcedure.input(z.object({
        title: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const refreshToken = await ctx.prisma.ebayCreds.findFirst();
        const accessToken = await ebayAuthToken.getAccessToken('PRODUCTION', refreshToken, process.env.EBAY_SCOPES?.split(" "))
        // create the listing::::
    })
});
