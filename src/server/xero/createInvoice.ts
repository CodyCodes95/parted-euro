import type { TokenSet, LineItem } from "xero-node";
import { XeroClient, Invoice, LineAmountTypes, Address } from "xero-node";
import { prisma } from "../db/client";
import type Stripe from "stripe";
import { sendNewOrderEmail } from "../resend/resend";
import { initXero } from "../trpc/router/xero";

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: process.env.XERO_SCOPES!.split(" "),
});

export const createInvoice = async (
  event: Stripe.Checkout.Session,
  //   Need to find how to get the right type for event
  //   event: Stripe.Event.Data.Object,
  lineItems: Stripe.LineItem[],
) => {
  try {
    await initXero();
    const activeTenantId = xero.tenants[0].tenantId as string;

    const invoiceDate = new Date().toISOString().split("T")[0];

    const lineItemsFormatted = lineItems.map((item) => {
      return {
        description: item.description,
        quantity: item.quantity ?? 1,
        unitAmount: item.price!.unit_amount! / 100,
        accountCode: "200",
        tracking: [
          {
            name: "VIN",
            // @ts-expect-error: bad types
            option: item.price.product.metadata.VIN,
          },
        ],
        // lineAmount: (item.amount_total / 100) * (item.quantity ?? 1),
      } as LineItem;
    });

    let shipping;

    if (event.shipping_cost?.amount_total) {
      shipping = event.shipping_cost.amount_total / 100;
      lineItemsFormatted.push({
        description: "Shipping",
        quantity: 1,
        unitAmount: event.shipping_cost.amount_total / 100,
        accountCode: "210",
        lineAmount: event.shipping_cost.amount_total / 100,
      });
    }
    const invoiceToCreate: Invoice = {
      type: Invoice.TypeEnum.ACCREC,
      contact: {
        emailAddress: event.customer_details!.email!,
        name: event.customer_details!.name!,
        addresses: [
          {
            addressType: Address.AddressTypeEnum.POBOX, 
            addressLine1: event.customer_details!.address!.line1!,
            addressLine2: event.customer_details!.address!.line2!,
            city: event.customer_details!.address!.city!,
            postalCode: event.customer_details!.address!.postal_code!,
            country: event.customer_details!.address!.country!,
          },
        ],
      },
      date: invoiceDate,
      dueDate: invoiceDate,
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
          amount: event.amount_total! / 100,
        },
      ],
    };

    const invoice = createInvoiceResponse?.body?.invoices[0];

    const xeroInvoiceId = createInvoiceResponse?.body?.invoices[0]?.invoiceID!;

    const paymentResponse = await xero.accountingApi.createPayments(
      activeTenantId,
      payment,
    );
    const order = await prisma.order.update({
      where: {
        id: event.metadata!.orderId,
      },
      data: {
        shipping: shipping ?? 0,
        paymentIntentId: event.payment_intent as string,
        xeroInvoiceId: invoice?.invoiceNumber,
        shippingAddress: `${event.shipping_details!.address!.line1}, ${
          event.shipping_details!.address!.line2 ?? " "
        }, ${event.shipping_details!.address!.city}, ${
          event.shipping_details!.address!.postal_code
        }, ${event.shipping_details!.address!.country}`,
        xeroInvoiceRef: invoice?.invoiceID,
        shippingRateId: event.shipping_cost!.shipping_rate! as string,
      },
    });
    await sendNewOrderEmail(order);
    await xero.accountingApi.emailInvoice(activeTenantId, xeroInvoiceId, {});
    return;
  } catch (err) {
    // write event and lineitems to db
    await prisma.failedOrder.create({
      data: {
        orderId: event.metadata!.orderId!,
        stripeEvent: JSON.stringify(event),
        lineItems: JSON.stringify(lineItems),
      },
    });
  }
};
