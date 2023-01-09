import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router } from "../trpc";

export const checkoutRouter = router({
  uploadListingImage: adminProcedure
    .input(
      z.object({
        image: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const uploadedImage = cloudinary.uploader
        .upload(input.image, {
          folder: "listings",
          // width: 300,
          // crop: "scale",
        })
        .then((res) => {
          return res;
        });
    }),
  createImageRecord: adminProcedure
    .input(
      z.object({
        url: z.string().min(3),
        listingId: z.string().min(3),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.image.create({ data: input });
    }),
});

// const stripe = require("stripe")(process.env.STRIPE_PRIVATE);
// const { createOrder } = require("../controllers/orderController");

// const createCheckoutSession = asyncHandler(async (req, res) => {
//   console.log(req.body);
//   try {
//     const customer = await stripe.customers.create({
//       metadata: {
//         userID: req.user.id,
//         cart: JSON.stringify(req.body.items),
//       },
//     });
//     const storeItems = await ProductModel.find();
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       customer: customer.id,
//       line_items: req.body.items.map((item) => {
//         const storeItem = storeItems.find(
//           (storeItem) => storeItem._id.toString() === item._id
//         );
//         return {
//           price_data: {
//             currency: "aud",
//             product_data: {
//               name: storeItem.name,
//             },
//             unit_amount: storeItem.price,
//           },
//           quantity: item.quantity,
//         };
//       }),
//       success_url: `${process.env.CLIENT_URL}/cart/checkout/success`,
//       cancel_url: `${process.env.CLIENT_URL}/cart/checkout/failure`,
//     });
//     res.json({ url: session.url });
//   } catch (err) {
//     console.error(err);
//   }
// });

// const stripeWebhook = asyncHandler(async (req, res) => {
//   let endpointSecret;
//   const sig = req.headers["stripe-signature"];

//   let data;
//   let eventType;

//   if (endpointSecret) {
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       console.log("Webhook verified");
//     } catch (err) {
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
//   if (eventType === "checkout.session.completed") {
//     stripe.customers
//       .retrieve(data.customer)
//       .then((customer) => {
//         console.log(customer);
//         createOrder(customer);
//       })
//       .catch((err) => console.log(err.message));
//   }

//   // Return a 200 res to acknowledge receipt of the event
//   res.send().end();
// });