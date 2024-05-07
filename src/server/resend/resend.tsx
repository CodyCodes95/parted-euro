import { Resend } from "resend";
import type { OrderWithItems } from "../../utils/trpc";
import ReadyForPickupEmail from "./emails/readyForPickup";
import NewOrderEmail from "./emails/OrderPlaced";
import OrderShippedEmail from "./emails/OrderShipped";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendOrderShippedEmail = async (order: OrderWithItems) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "codythatsme@gmail.com",
    subject: "Order shipped!",
    react: <OrderShippedEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};

export const sendNewOrderEmail = async (order: OrderWithItems) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "codythatsme@gmail.com",
    subject: "New order placed!",
    react: <NewOrderEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};
