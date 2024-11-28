import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import type { StripeShippingOption } from "../../../server/trpc/router/checkout";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2022-11-15",
});

const prisma = new PrismaClient();

export type CheckoutItem = {
  itemId: string;
  quantity: number;
  price?: number;
};

type CheckoutQuery = {
  items: string;
  name: string; // Full name
  email: string; // Email address
  countryCode: string; // ISO 3166-1 alpha-2 country code
  shippingOptions: string;
};

type StripeSessionRequest = {
  shippingOptions: StripeShippingOption[];
  email: string;
  name: string;
  items: CheckoutItem[];
  countryCode: string;
};

export const createStripeSession = async (input: StripeSessionRequest) => {
  const { items, shippingOptions, email, name, countryCode } = input;
  try {
    const redirectURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `https://partedeuro.com.au`;

    // const {
    //   items,
    //   shippingOptions,
    //   email,
    //   name,
    //   countryCode,
    // }: StripeSessionRequest = JSON.parse(req.body);

    // get items from query

    const listingsPurchased = await prisma.listing.findMany({
      where: {
        id: {
          in: items.map((item) => item.itemId),
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        parts: {
          select: {
            donor: {
              select: {
                vin: true,
              },
            },
            inventoryLocation: {
              select: {
                name: true,
              },
            },
            partDetails: {
              select: {
                partNo: true,
                alternatePartNumbers: true,
                name: true,
                weight: true,
                length: true,
                width: true,
                height: true,
              },
            },
          },
        },
      },
    });

    // create a new customer

    const customer = await stripe.customers.create({
      email,
      name,
    });

    const stripeLineItems = listingsPurchased.map((item) => {
      const itemProvided = items.find(
        (itemQuery) => itemQuery.itemId === item.id,
      );
      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: item.title,
            images: [item.images[0]!.url],
            metadata: {
              VIN: item.parts[0]?.donor!.vin,
              inventoryLocations: item.parts
                .map((part) => part.inventoryLocation?.name)
                .join(","),
            },
          },
          unit_amount: (itemProvided?.price ?? item.price) * 100,
        },
        quantity: itemProvided!.quantity,
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

    for (const item of listingsPurchased) {
      const itemProvided = items.find(
        (itemQuery) => itemQuery.itemId === item.id,
      );
      const orderItem = await prisma?.orderItem.create({
        data: {
          listingId: item.id,
          quantity: itemProvided!.quantity,
          orderId: order?.id,
        },
      });
      await prisma?.order.update({
        where: {
          id: order?.id,
        },
        data: {
          orderItems: {
            connect: {
              id: orderItem?.id,
            },
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card", "afterpay_clearpay"],
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: [countryCode as any],
      },
      shipping_options: shippingOptions as any,
      line_items: stripeLineItems as any,
      mode: "payment",
      success_url: `${redirectURL}/orders/confirmation?orderId=${order?.id}`,
      cancel_url: `${redirectURL}/checkout`,
      metadata: {
        orderId: order?.id ?? "",
      },
    });

    return {
      url: session.url,
    };
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

async function GET(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query as unknown as CheckoutQuery;

  const { items, shippingOptions, email, name, countryCode } = query;

  const itemsParsed = JSON.parse(items) as CheckoutItem[];

  if (itemsParsed.some((item) => typeof item.price !== "undefined")) {
    throw new Error("Unsupported setting of prices");
  }

  const parsedShippingOptions = JSON.parse(
    shippingOptions,
  ) as StripeShippingOption[];
  const session = await createStripeSession({
    items: itemsParsed,
    shippingOptions: parsedShippingOptions,
    email,
    name,
    countryCode,
  });

  res.json({ url: session.url });
}

export default GET;
