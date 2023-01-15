import { buffer } from "micro";
// const stripe = require("stripe")(process.env.STRIPE_SECRET);
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function stripeWebhook(req: any, res: any) {
  console.log("WE RUNNING =====================================");

  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let eventType;
    let data:any
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret as string);
      console.log("Webhook verified");
    } catch (err: any) {
      console.log(`Webhook failed ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = event.data.object;
    eventType = event.type;
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer: any) => {
          console.log(customer);
          // createOrder(customer)
        })
        .catch((err: any) => console.log(err.message));
    }
    console.log(`Webhook received: ${event.type}`);
    res.status(200).send();
  }
}
