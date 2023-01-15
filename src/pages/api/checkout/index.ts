import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});


async function CreateStripeSession(req: any, res: any) {
  
  const { items } = JSON.parse(req.body)

  let orderId

  const redirectURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item: any) => {
      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: item.listingTitle,
            images: [item.listingImage],
          },
          unit_amount: item.listingPrice,
        },
        quantity: item.quantity,
      };
    }),
    mode: "payment",
    success_url: `${redirectURL}?orderId=${orderId}/orderConfirmation&status=success`,
    cancel_url: `${redirectURL}/checkout`,
    metadata: {
      images: items.image,
    },
  });

  res.json({ url: session.url });
}

export default CreateStripeSession;
