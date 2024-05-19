import { Resend } from "resend";
import type { OrderWithItems } from "../../utils/trpc";
import NewOrderEmail from "./emails/OrderPlaced";
import OrderShippedEmail from "./emails/OrderShipped";
import type { Order } from "@prisma/client";
import ReadyForPickupEmail from "./emails/readyForPickup";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendOrderShippedEmail = async (order: OrderWithItems) => {
  if (!order?.email) return;
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: order?.email,
    subject: "Order shipped!",
    react: <OrderShippedEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};

export const sendOrderReadyForPickupEmail = async (order: OrderWithItems) => {
  if (!order?.email) return;
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    // to: "codythatsme@gmail.com",
    to: order?.email,
    subject: "Order ready for pickup!",
    react: <ReadyForPickupEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};

export const sendNewOrderEmail = async (order: Order) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    // from: "contact@partedeuro.com.au",
    to: "contact@partedeuro.com.au",
    subject: "New order placed!",
    react: <NewOrderEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};
