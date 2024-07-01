import { buffer } from "micro";
import Stripe from "stripe";
import { createInvoice } from "../../../server/xero/createInvoice";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
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
      webhookSecret as string,
    );
    if (stripeEvent.type === "checkout.session.completed") {
      const data = stripeEvent.data.object;
      // unsure why we need to ignore here. Stripe doesn't seem to change the type of data based on the event type above
      // @ts-ignore
      const lineItems = await stripe.checkout.sessions.listLineItems(data.id, {
        expand: ["data.price.product"],
      });
      try {
        await createInvoice(data, lineItems.data);
        return res.status(200).send(`Invoice created`);
      } catch (err: any) {
        console.log(err);
        return res
          .status(500)
          .send(`Error while trying to create Xero invoice: ${err.message}`);
      }
    }

    console.log(`Webhook received: ${stripeEvent.type}`);
    return res.status(200).send(`Webhook received: ${stripeEvent.type}`);
  } catch (err: any) {
    console.log(`Webhook failed ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
