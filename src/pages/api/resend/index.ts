import type { NextApiRequest, NextApiResponse } from "next";
import type { OrderWithItems } from "../../../utils/trpc";
import { sendNewOrderEmail } from "../../../server/resend/resend";

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { order } = JSON.parse(req.body) as Record<"order", OrderWithItems>;
  await sendNewOrderEmail(order);
  res.status(200).send(`Email sent`);
}

export default POST;