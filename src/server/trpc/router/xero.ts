import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import type { TokenSet } from "xero-node";
import { XeroClient } from "xero-node";
import { prisma } from "../../db/client";

export const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: process.env.XERO_SCOPES?.split(" "),
});

export const initXero = async () => {
  await xero.initialize();
  const xeroCreds = await prisma.xeroCreds.findFirst();
  if (!xeroCreds) throw new Error("Xero credentials not found");
  xero.setTokenSet(xeroCreds.tokenSet as TokenSet);
  const xeroTokenSet = xero.readTokenSet();

  if (xeroTokenSet.expired()) {
    const validTokenSet = await xero.refreshToken();
    const creds = await prisma.xeroCreds.findFirst();
    await prisma.xeroCreds.update({
      where: {
        id: creds?.id,
      },
      data: {
        tokenSet: validTokenSet as any,
        refreshToken: validTokenSet.refresh_token,
      },
    });
    xero.setTokenSet(validTokenSet as any);
  }
  await xero.updateTenants();
  return xero
};

export const xeroRouter = router({
  // getExpiry: adminProcedure.query(async ({ ctx }) => {
  //   const creds = await ctx.prisma.xeroCreds.findFirst();
  //   const today = new Date();
  //   const tokenDate = new Date(creds?.updatedAt as Date);
  //   const expirationDate = new Date(
  //     tokenDate.getTime() + 59 * 24 * 60 * 60 * 1000,
  //   );
  //   const daysTillExpiry = Math.ceil(
  //     (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  //   );
  //   return {
  //     daysTillExpiry: daysTillExpiry,
  //   };
  // }),
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
    const consentUrl = await xero.buildConsentUrl();
    return consentUrl;
  }),
  updateTokenset: adminProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tokenSet = (await xero.apiCallback(input.code)) as any;
        const creds = await ctx.prisma.xeroCreds.findFirst();
        if (!creds) throw new Error("Xero credentials not found");
        const updatedCreds = await ctx.prisma.xeroCreds.update({
          where: {
            id: creds.id,
          },
          data: {
            tokenSet: tokenSet,
            refreshToken: tokenSet.refresh_token,
          },
        });
        return {
          updatedCreds,
        };
      } catch (err: any) {
        return {
          error: err.message,
        };
      }
    }),
  testXeroConnection: adminProcedure.query(async ({ ctx }) => {
    await initXero();
    const activeTenantId = xero.tenants[0].tenantId;
    return !!activeTenantId;
  }),
});
