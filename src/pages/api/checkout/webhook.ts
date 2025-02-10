import { buffer } from "micro";
import Stripe from "stripe";
import { createInvoiceFromStripeEvent } from "../../../server/xero/createInvoice";
import type { NextApiRequest, NextApiResponse } from "next";
import { isError } from "../../../utils/error";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function stripeWebhook(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const rawBody = await buffer(req);
  const stripeSignature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature as string,
      webhookSecret!,
    );
    if (stripeEvent.type === "checkout.session.completed") {
      const data = stripeEvent.data.object as Stripe.Checkout.Session;
      const lineItems = await stripe.checkout.sessions.listLineItems(data.id, {
        expand: ["data.price.product"],
      });
      try {
        await createInvoiceFromStripeEvent(data, lineItems.data);
        return res.status(200).send(`Invoice created`);
      } catch (err: unknown) {
        console.error("Error creating Xero invoice:", err);
        const errorMessage = isError(err)
          ? err.message
          : "Unknown error occurred";
        return res
          .status(500)
          .send(`Error while trying to create Xero invoice: ${errorMessage}`);
      }
    }

    console.log(`Webhook received: ${stripeEvent.type}`);
    return res.status(200).send(`Webhook received: ${stripeEvent.type}`);
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    const errorMessage = isError(err) ? err.message : "Unknown error occurred";
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }
}
