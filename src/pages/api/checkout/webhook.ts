import { buffer } from "micro";
import Stripe from "stripe";
import type {
  RequestEmpty,
  TokenSet,
  LineItem} from "xero-node";
import {
  XeroClient,
  Invoice
} from "xero-node";
import { prisma } from "../../../server/db/client";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID as string,
  clientSecret: process.env.XERO_CLIENT_SECRET as string,
  redirectUris: [process.env.XERO_REDIRECT_URI as string],
  scopes: process.env.XERO_SCOPES?.split(" "),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const createInvoice = async (event: any, lineItems: any) => {
  await xero.initialize();
  const xeroCreds = await prisma.xeroCreds.findFirst();
  xero.setTokenSet(xeroCreds?.tokenSet as TokenSet);
  const xeroTokenSet = xero.readTokenSet();
  if (xeroTokenSet.expired()) {
    const validTokenSet = (await xero.refreshToken()) as any;
    const creds = await prisma.xeroCreds.findFirst();
    const updatedCreds = await prisma.xeroCreds.update({
      where: {
        id: creds?.id,
      },
      data: {
        tokenSet: validTokenSet,
        refreshToken: validTokenSet.refresh_token,
      },
    });
  }
  await xero.updateTenants();
  const activeTenantId = xero.tenants[0].tenantId;

  const lineItemsFormatted = lineItems.map((item: any) => {
    return {
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.amount_total / 100,
      accountCode: "200",
      taxType: "Inclusive",
      // itemCode: JSON.parse(event.metadata.inventoryLocations)[item.description],
      lineAmount: (item.amount_total / 100) * item.quantity,
    } as LineItem;
  });

  lineItemsFormatted.push({
    description: "Shipping",
    quantity: 1,
    unitAmount: event.shipping_cost.amount_total / 100,
    accountCode: "210",
    taxType: "Inclusive",
    lineAmount: event.shipping_cost.amount_total / 100,
  });

  const createInvoiceResponse = await xero.accountingApi.createInvoices(
    activeTenantId,
    {
      invoices: [
        {
          type: Invoice.TypeEnum.ACCREC,
          contact: {
            emailAddress: event.customer_details.email,
            name: event.customer_details.name,
          },
          date: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
          reference: event.payment_intent,
          // status: Invoice.StatusEnum.PAID,
          status: Invoice.StatusEnum.PAID,
          lineItems: lineItemsFormatted,
        },
      ],
    }
  );
  if (createInvoiceResponse?.body?.invoices) {
    const paymentResponse = await xero.accountingApi.createPayments(
      activeTenantId,
      {
        payments: [
          {
            invoice: {
              invoiceID: createInvoiceResponse?.body?.invoices[0]?.invoiceID,
            },
            account: {
              code: process.env.XERO_BANK_ACCOUNT,
            },
            date: new Date().toISOString().split("T")[0],
            amount: event.amount_total / 100,
          },
        ],
      }
    );
    const requestEmpty: RequestEmpty = {};
    const emailInvoiceResponse = await xero.accountingApi.emailInvoice(
      activeTenantId,
      createInvoiceResponse?.body?.invoices[0]?.invoiceID as string,
      requestEmpty
    );
    return paymentResponse;
  }
  return { error: "no invoice created" };

  // const res = await saveInvoice.mutateAsync({
  //   email: event.customer_details.email,
  //   name: event.customer_details.name,
  //   orderNo: event.payment_intent,
  //   items: lineItems.map((item: any) => {
  //     title: item.description,
  //       quantity: item.quantity,
  //       price: item.amount_total,
  //         inventoryLocation: JSON.parse(event.metadata.inventoryLocations)[item.description],
  // });
};

export default async function stripeWebhook(req: any, res: any) {
  console.log("WE RUNNING =====================================");

  if (req.method === "POST") {
   const rawBody = await buffer(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret as string);
      console.log("Webhook verified");
    } catch (err: any) {
      console.log(`Webhook failed ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    const data = event.data.object as any;
    const eventType = event.type;
    if (eventType === "checkout.session.completed") {
      const lineItems = await stripe.checkout.sessions.listLineItems(data.id);
      const invoiceRes = await createInvoice(data, lineItems.data);
      res.status(200).send(invoiceRes);
    }
    console.log(`Webhook received: ${event.type}`);
    res.status(200).send();
  }
}
