import Stripe from "stripe"
import { buffer } from "micro"
const stripe = require("stripe")(process.env.STRIPE_SECRET);

export const config = {
    api: {
        bodyParser: false
    }
}

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function stripeWebhook(req: any, res: any) {

    console.log("WE RUNNING =====================================")

    if (req.method === "POST") {
        const buf = await buffer(req)
        const sig = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event

        try {
            if (!sig || !webhookSecret) return

            event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
        } catch (err: any) {
            console.error(err.message)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }

        console.log(`Webhook received: ${event.type}`)

        res.status(200).send()
    }
}

//   let endpointSecret;
//   const sig = req.headers["stripe-signature"];

//   let data;
//   let eventType;

//   if (endpointSecret) {
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       console.log("Webhook verified");
//     } catch (err: any) {
//       console.log(`Webhook failed ${err.message}`);
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//     data = event.data.object;
//     eventType = event.type;
//   } else {
//     data = req.body.data.object;
//     eventType = req.body.type;
//   }

//   // Handle the event
//   // if (eventType === "checkout.session.completed") {
//   //     stripe.customers
//   //         .retrieve(data.customer)
//   //         .then((customer: any) => {
//   //             console.log(customer);
//   //             createOrder(customer)
//   //         })
//   //         .catch((err:any) => console.log(err.message));
//   // }

//   // Return a 200 res to acknowledge receipt of the event
//   res.send(200);
// }

