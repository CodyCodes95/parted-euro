import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { XeroClient, Invoice, RequestEmpty } from "xero-node";

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
  createInvoice: adminProcedure
    .input(
      z.object({
        email: z.string(),
        orderNo: z.string(),
        cart: z.array(
          z.object({
            partId: z.string(),
            title: z.string(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tokenSet = await xero.refreshToken();
      await xero.updateTenants();
      const activeTenantId = xero.tenants[0].tenantId;
      const createInvoiceResponse = await xero.accountingApi.createInvoices(
        activeTenantId,
        {
          invoices: [
            {
              type: Invoice.TypeEnum.ACCREC,
              contact: {
                emailAddress: input.email,
              },
              date: new Date().toISOString().split("T")[0],
              reference: input.orderNo,
              status: Invoice.StatusEnum.PAID, //can this be done?
              lineItems: input.cart.map((item) => {
                return {
                  description: item.title,
                  quantity: item.quantity,
                  unitAmount: item.price,
                  // accountCode: "200", not sure if this is needed, hope not because don't know what it is
                  // taxType: once again unsure what this is
                  lineAmount: item.price * item.quantity,
                };
              }),
            },
          ],
        }
      );
    //   if (createInvoiceResponse?.body?.invoices) {
    //     const invoiceId = createInvoiceResponse.body.invoices[0]?.invoiceID;
    //     const requestEmpty: RequestEmpty = {};
    //     const emailInvoiceResponse = await xero.accountingApi.emailInvoice(
    //       activeTenantId,
    //       invoiceId as string,
    //       requestEmpty
    //     );
    //   }
        // Unsure how above works, does Xero get the email from the invoice we created to send?
        return {
            createInvoiceResponse
        }
    }),
  authenticate: adminProcedure.mutation(async ({ ctx }) => {
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
