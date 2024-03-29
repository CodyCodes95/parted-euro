import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import type { CartItem } from "../../../context/cartContext";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});

const prisma = new PrismaClient();

type StripeSessionRequest = {
  regularShipping: string;
  expressShipping: string;
  email: string;
  name: string;
  items: CartItem[];
};

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const redirectURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${req.headers.host}`;

  const {
    items,
    regularShipping,
    expressShipping,
    email,
    name,
  }: StripeSessionRequest = JSON.parse(req.body);

  // create a new customer

  const customer = await stripe.customers.create({
    email,
    name,
  });

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    [];

  // Local pickup option as a default
  shippingOptions.push({
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 0, currency: "aud" },
      display_name: "Pickup from Parted Euro",
    },
  });

  // If shipping is sent through, the user selected to ship
  if (regularShipping && expressShipping) {
    shippingOptions.push(
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Number(regularShipping) * 100,
            currency: "aud",
          },
          display_name: "AusPost Regular",
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Number(expressShipping) * 100,
            currency: "aud",
          },
          display_name: "AusPost Express",
        },
      },
    );
  }

  // const inventoryLocations = {} as any;

  // items.forEach((item: any) => {
  //   // inventoryLocations[item.listingTitle] = item.inventoryLocations
  //   inventoryLocations[item.listingTitle] = "test";
  // });

  const stripeLineItems = items.map((item) => {
    return {
      price_data: {
        currency: "aud",
        product_data: {
          name: item.listingTitle,
          images: [item.listingImage!],
          metadata: {
            VIN: item.itemVin,
            // inventoryLocations: "A44",
          },
        },
        unit_amount: item.listingPrice * 100,
      },
      quantity: item.quantity,
    };
  });

  const order = await prisma?.order.create({
    data: {
      email,
      name,
      status: "PENDING",
      subtotal: stripeLineItems.reduce(
        (acc, cur) => acc + cur.price_data.unit_amount * cur.quantity,
        0,
      ),
    },
  });

  for (const item of items) {
    const orderItem = await prisma?.orderItem.create({
      data: {
        listingId: item.listingId,
        quantity: item.quantity,
        orderId: order?.id as string,
      },
    });
    await prisma?.order.update({
      where: {
        id: order?.id as string,
      },
      data: {
        orderItems: {
          connect: {
            id: orderItem?.id as string,
          },
        },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card", "afterpay_clearpay"],
    shipping_address_collection: {
      allowed_countries: ["AU"],
    },
    shipping_options: shippingOptions,
    line_items: stripeLineItems,
    mode: "payment",
    success_url: `${redirectURL}/orders/confirmation?orderId=${order?.id}`,
    cancel_url: `${redirectURL}/checkout`,
    metadata: {
      orderId: order?.id ?? "",
    },
  });

  res.json({ url: session.url });
}

export default POST;
