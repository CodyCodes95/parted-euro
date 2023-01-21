import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { XeroClient } from "xero-node";

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID as string,
  clientSecret: process.env.XERO_CLIENT_SECRET as string,
  redirectUris: [process.env.XERO_REDIRECT_URI as string],
  scopes: process.env.XERO_SCOPES?.split(" "),
});

export const xeroRouter = router({
  getExpiry: adminProcedure.query(async ({ ctx }) => {
    const creds = await ctx.prisma.xeroCreds.findFirst();
    const today = new Date();
    const tokenDate = new Date(creds?.updatedAt as Date);
    const expirationDate = new Date(
      tokenDate.getTime() + 59 * 24 * 60 * 60 * 1000
    );
    const daysTillExpiry = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      daysTillExpiry: daysTillExpiry,
    };
  }),
  getAccessToken: adminProcedure.query(async ({ ctx }) => {
    const token = await ctx.prisma.xeroCreds.findFirst();
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        grant_type: "refresh_token",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: token?.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();
    return {
      accessToken: data.access_token,
    };
  }),
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
    // const clientId = process.env.XERO_CLIENT_ID;
    // const clientSecret = process.env.XERO_CLIENT_SECRET;
    // const scopes = process.env.XERO_SCOPES;
    // const redirectUri = process.env.XERO_REDIRECT_URI;
    let consentUrl = await xero.buildConsentUrl();
    return {
      url: consentUrl,
    };
  }),
  updateRefreshToken: adminProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tokenSet = await xero.apiCallback(input.code);
      console.log(tokenSet);
      const creds = await ctx.prisma.xeroCreds.findFirst();
      const updatedCreds = await ctx.prisma.xeroCreds.update({
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
});
