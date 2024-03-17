import { OrderItem } from "./../../pages/admin/listings";
import type { TokenSet, LineItem } from "xero-node";
import { XeroClient, Invoice, LineAmountTypes } from "xero-node";
import { prisma } from "../db/client";
import type Stripe from "stripe";

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID as string,
  clientSecret: process.env.XERO_CLIENT_SECRET as string,
  redirectUris: [process.env.XERO_REDIRECT_URI as string],
  scopes: process.env.XERO_SCOPES?.split(" "),
});

export const createInvoice = async (
  event: any,
  //   Need to find how to get the right type for event
  //   event: Stripe.Event.Data.Object,
  lineItems: Stripe.LineItem[],
) => {
  await xero.initialize();
  const xeroCreds = await prisma.xeroCreds.findFirst();
  xero.setTokenSet(xeroCreds?.tokenSet as TokenSet);
  const xeroTokenSet = xero.readTokenSet();

  if (xeroTokenSet.expired()) {
    const validTokenSet = (await xero.refreshToken()) as any;
    const creds = await prisma.xeroCreds.findFirst();
    await prisma.xeroCreds.update({
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

  const invoiceDate = new Date().toISOString().split("T")[0];

  console.log(console.log(JSON.stringify(lineItems, null, 2)));

  const lineItemsFormatted = lineItems.map((item) => {
    return {
      description: item.description,
      quantity: item.quantity ?? 1,
      unitAmount: item.price!.unit_amount! / 100,
      accountCode: "200",
      tracking: [
        {
          name: "VIN",
          // @ts-ignore
          option: item.price.product.metadata.VIN,
        },
      ],
      // lineAmount: (item.amount_total / 100) * (item.quantity ?? 1),
    } as LineItem;
  });

  let shipping;

  if (event.shipping_cost.amount_total) {
    shipping = event.shipping_cost.amount_total / 100;
    lineItemsFormatted.push({
      description: "Shipping",
      quantity: 1,
      unitAmount: event.shipping_cost.amount_total / 100,
      accountCode: "210",
      lineAmount: event.shipping_cost.amount_total / 100,
    });
  }
  console.log(JSON.stringify(event, null, 2));

  const invoiceToCreate: Invoice = {
    type: Invoice.TypeEnum.ACCREC,
    contact: {
      emailAddress: event.customer_details.email,
      name: event.customer_details.name,
      addresses: [
        {
          addressLine1: event.shipping._details.address.line1,
          addressLine2: event.shipping._details.address.line2,
          city: event.shipping._details.address.city,
          postalCode: event.shipping._details.address.postal_code,
          country: event.shipping._details.address.country,
        },
      ],
    },
    date: invoiceDate,
    dueDate: invoiceDate,
    reference: event.payment_intent,
    status: Invoice.StatusEnum.AUTHORISED,
    lineItems: lineItemsFormatted,
    lineAmountTypes: LineAmountTypes.Inclusive,
  };

  const createInvoiceResponse = await xero.accountingApi.createInvoices(
    activeTenantId,
    {
      invoices: [invoiceToCreate],
    },
  );

  if (!createInvoiceResponse?.body?.invoices) {
    throw new Error("No invoice created");
  }

  const payment = {
    payments: [
      {
        invoice: {
          invoiceID: createInvoiceResponse?.body?.invoices[0]?.invoiceID,
        },
        account: {
          code: process.env.XERO_BANK_ACCOUNT,
        },
        date: invoiceDate,
        amount: event.amount_total / 100,
      },
    ],
  };

  const invoice = createInvoiceResponse?.body?.invoices[0];

  const xeroInvoiceId = createInvoiceResponse?.body?.invoices[0]
    ?.invoiceID as string;

  const paymentResponse = await xero.accountingApi.createPayments(
    activeTenantId,
    payment,
  );
  const order = await prisma.order.update({
    where: {
      id: event.metadata.orderId,
    },
    data: {
      status: "Paid",
      shipping,
      xeroInvoiceId: invoice?.invoiceNumber,
      xeroInvoiceRef: invoice?.invoiceID,
    },
  });
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId: event.metadata.orderId,
    },
    include: {
      listing: true,
    },
  });
  for (const item of orderItems) {
    const listing = item.listing.id;
    const listingItems = await prisma.listing.findUnique({
      where: {
        id: listing,
      },
      include: {
        parts: true,
      },
    });
    for (const part of listingItems!.parts) {
      await prisma.listing.update({
        where: {
          id: listing,
        },
        data: {
          parts: {
            update: {
              where: {
                id: part.id,
              },
              data: {
                quantity: part.quantity - item.quantity,
              },
            },
          },
        },
      });
    }
  }
  await xero.accountingApi.emailInvoice(activeTenantId, xeroInvoiceId, {});
  return paymentResponse.body;
};
