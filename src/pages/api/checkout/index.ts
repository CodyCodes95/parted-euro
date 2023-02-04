import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});


async function CreateStripeSession(req: any, res: any) {
  
  const { items, regularShipping, expressShipping } = JSON.parse(req.body);

  const inventoryLocations = {} as any

  items.forEach((item:any) => {
    // inventoryLocations[item.listingTitle] = item.inventoryLocations
    inventoryLocations[item.listingTitle] = "test"

  }
)


  let orderId

  const redirectURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${req.headers.host}`;


  const session = await stripe.checkout.sessions.create({
    // customer: customer.id,
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["AU"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Number(regularShipping) * 100, currency: "aud" },
          display_name: "AusPost Regular",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Number(expressShipping) * 100, currency: "aud" },
          display_name: "AusPost Express",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "aud" },
          display_name: "Pickup from Parted Euro",
        },
      },
    ],
    line_items: items.map((item: any) => {
      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: item.listingTitle,
            images: [item.listingImage],
            metadata: {
              inventoryLocations: "A44",
            },
          },
          unit_amount: item.listingPrice * 100,
        },
        quantity: item.quantity,
      };
    }),
    mode: "payment",
    success_url: `${redirectURL}/orders/confirmation`,
    cancel_url: `${redirectURL}/checkout`,
    metadata: {
      images: items.image,
      inventoryLocations: JSON.stringify(inventoryLocations),
    },
  });

  res.json({ url: session.url });
}

export default CreateStripeSession;
