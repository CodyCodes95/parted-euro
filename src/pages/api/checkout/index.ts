import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import type { CartItem } from "../../../context/cartContext";
import { PrismaClient } from "@prisma/client";
import type { StripeShippingOption } from "../../../server/trpc/router/checkout";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2022-11-15",
});

const prisma = new PrismaClient();

type StripeSessionRequest = {
  shippingOptions: StripeShippingOption[];
  email: string;
  name: string;
  items: CartItem[];
  countryCode: string;
};

async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redirectURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `https://${req.headers.host}`;

    // const {
    //   items,
    //   shippingOptions,
    //   email,
    //   name,
    //   countryCode,
    // }: StripeSessionRequest = JSON.parse(req.body);

    type ItemQuery = {
      itemId: string;
      quantity: number;
    };

    type CheckoutQuery = {
      items: string;
      name: string; // Full name
      email: string; // Email address
      countryCode: string; // ISO 3166-1 alpha-2 country code
      shippingOptions: string
    };

    const query = req.query as unknown as CheckoutQuery;

    const { items, shippingOptions, email, name, countryCode } = query;

    const itemsParsed = JSON.parse(items) as ItemQuery[];

    const parsedShippingOptions = JSON.parse(shippingOptions) as StripeShippingOption[];

    console.log(
      itemsParsed.map((item) => item.itemId),
      shippingOptions,
      email,
      name,
      countryCode
    )

    // get items from query

    const listingsPurchased = await prisma.listing.findMany({
      where: {
        id: {
          in: itemsParsed.map((item) => item.itemId),
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
          unit_amount: item.price * 100,
        },
        quantity: itemsParsed.find((itemQuery) => itemQuery.itemId === item.id)!
          .quantity,
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
      const orderItem = await prisma?.orderItem.create({
        data: {
          listingId: item.id,
          quantity: itemsParsed.find(
            (itemQuery) => itemQuery.itemId === item.id,
          )!.quantity,
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
      shipping_address_collection: {
        allowed_countries: [countryCode as any],
      },
      shipping_options:
        parsedShippingOptions as unknown as Stripe.Checkout.Session.ShippingOption[],
      line_items: stripeLineItems,
      mode: "payment",
      success_url: `${redirectURL}/orders/confirmation?orderId=${order?.id}`,
      cancel_url: `${redirectURL}/checkout`,
      metadata: {
        orderId: order?.id ?? "",
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.log(err.message);
    throw new Error(err.message);
  }
}

export default GET;
