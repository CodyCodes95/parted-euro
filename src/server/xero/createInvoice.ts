import type { TokenSet, LineItem } from "xero-node";
import { XeroClient, Invoice, LineAmountTypes } from "xero-node";
import { prisma } from "../db/client";
import type Stripe from "stripe";
import { sendNewOrderEmail } from "../resend/resend";

type StripeEvent = {
  id: string;
  object: string;
  after_expiration: null;
  allow_promotion_codes: null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: {
    enabled: boolean;
    liability: null;
    status: null;
  };
  billing_address_collection: null;
  cancel_url: string;
  client_reference_id: null;
  client_secret: null;
  consent: null;
  consent_collection: null;
  created: number;
  currency: string;
  currency_conversion: null;
  custom_fields: never[];
  custom_text: {
    after_submit: null;
    shipping_address: null;
    submit: null;
    terms_of_service_acceptance: null;
  };
  customer: string;
  customer_creation: null;
  customer_details: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: null;
      postal_code: string;
      state: string;
    };
    email: string;
    name: string;
    phone: null;
    tax_exempt: string;
    tax_ids: never[];
  };
  customer_email: null;
  expires_at: number;
  invoice: null;
  invoice_creation: {
    enabled: boolean;
    invoice_data: {
      account_tax_ids: null;
      custom_fields: null;
      description: null;
      footer: null;
      issuer: null;
      metadata: any;
      rendering_options: null;
    };
  };
  livemode: boolean;
  locale: null;
  metadata: {
    orderId: string;
  };
  mode: string;
  payment_intent: string;
  payment_link: null;
  payment_method_collection: string;
  payment_method_configuration_details: null;
  payment_method_options: {
    card: {
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  payment_status: string;
  phone_number_collection: {
    enabled: boolean;
  };
  recovered_from: null;
  saved_payment_method_options: {
    allow_redisplay_filters: string[];
    payment_method_remove: null;
    payment_method_save: null;
  };
  setup_intent: null;
  shipping_address_collection: {
    allowed_countries: string[];
  };
  shipping_cost: {
    amount_subtotal: number;
    amount_tax: number;
    amount_total: number;
    shipping_rate: string;
  };
  shipping_details: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: null;
      postal_code: string;
      state: string;
    };
    name: string;
  };
  shipping_options: {
    shipping_amount: number;
    shipping_rate: string;
  }[];
  status: string;
  submit_type: null;
  subscription: null;
  success_url: string;
  total_details: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
  ui_mode: string;
  url: null;
};

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
  try {
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
    const invoiceToCreate: Invoice = {
      type: Invoice.TypeEnum.ACCREC,
      contact: {
        emailAddress: event.customer_details.email,
        name: event.customer_details.name,
        // addresses: [
        //   {
        //     addressLine1: event.customer_details.address.line1,
        //     addressLine2: event.customer_details.address.line2,
        //     city: event.customer_details.address.city,
        //     postalCode: event.customer_details.address.postal_code,
        //     country: event.customer_details.address.country,
        //   },
        // ],
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
        shipping: shipping ?? 0,
        xeroInvoiceId: invoice?.invoiceNumber,
        shippingAddress: `${event.shipping_details.address.line1}, ${
          event.shipping_details.address.line2 ?? " "
        }, ${event.shipping_details.address.city}, ${
          event.shipping_details.address.postal_code
        }, ${event.shipping_details.address.country}`,
        xeroInvoiceRef: invoice?.invoiceID,
      },
    });
    sendNewOrderEmail(order);
    await xero.accountingApi.emailInvoice(activeTenantId, xeroInvoiceId, {});
    return;
  } catch (err) {
    // write event and lineitems to db
    await prisma.failedOrder.create({
      data: {
        orderId: event.metadata.orderId,
        stripeEvent: JSON.stringify(event),
        lineItems: JSON.stringify(lineItems),
      },
    });
  }
};
