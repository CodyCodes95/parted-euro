import { Resend } from "resend";
import type { OrderWithItems } from "../../utils/trpc";
import NewOrderEmail from "./emails/OrderPlaced";
import type { Order } from "@prisma/client";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const formatCurrency = (amount: number) =>
  amount.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });

function generateOrderEmailHTML(order: OrderWithItems): string {
  if (!order) throw new Error("Order not found");
  const orderItemsHTML = order.orderItems
    .map(
      (item) => `
    <tr>
      <td>
        <img src="${item.listing.images[0]
          ?.url}" alt="Product Image" width="60" height="60" style="vertical-align: middle; margin-right: 10px;">
        ${item.listing.title}
      </td>
      <td>${formatCurrency(item.listing.price)}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.listing.price * item.quantity)}</td>
    </tr>
  `,
    )
    .join("");

  const totalAmount = order.subtotal / 100 + (order.shipping ?? 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your order has shipped!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
        }
        .logo {
            display: block;
            margin: 0 auto 20px;
        }
        h1 {
            color: #4a4a4a;
            text-align: center;
        }
        .tracking-info {
            background-color: #e9e9e9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        .total-row {
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src=${baseUrl}/_next/static/media/logo.2d624463.png alt="Parted Euro's Logo" width="160" height="32" class="logo">
        <h1>Your order has shipped!</h1>
        <p>Hi ${order.name},</p>
        <p>Great news! Your order has shipped!</p>
        <div class="tracking-info">
        <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${order.shippingMethod}</p>
        </div>
        <p><strong>Below is a summary of your order ${
          order.xeroInvoiceId
        }:</strong></p>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderItemsHTML}
                <tr>
                    <td colspan="3"><strong>Shipping:</strong></td>
                    <td>${formatCurrency(order.shipping ?? 0)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3"><strong>Total:</strong></td>
                    <td>${formatCurrency(totalAmount)}</td>
                </tr>
            </tbody>
        </table>
        <p>Thanks again for shopping at Parted Euro!</p>
        <div class="footer">
            <p>If you have any questions, feel free to contact us directly.</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Main function to generate the email HTML
function generatePickupOrderEmailHTML(order: OrderWithItems): string {
  if (!order) throw new Error("Order not found");
  const orderItemsHTML = order.orderItems
    .map(
      (item, index) => `
    <tr>
      <td>
        <img src="${item.listing.images[0]
          ?.url}" alt="Product Image" width="60" height="60" style="vertical-align: middle; margin-right: 10px;">
      </td>
      <td>${item.listing.title}</td>
      <td>${formatCurrency(item.listing.price)}</td>
      <td>${item.quantity}</td>
    </tr>
  `,
    )
    .join("");

  const totalAmount = order.subtotal / 100;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your order is ready for pickup!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
        }
        .logo {
            display: block;
            margin: 0 auto 20px;
        }
        h1 {
            color: #4a4a4a;
            text-align: center;
        }
        .contact-info {
            background-color: #e9e9e9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        .total-row {
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${baseUrl}/_next/static/media/logo.2d624463.png" alt="Parted Euro's Logo" width="160" height="32" class="logo">
        <h1>Your order is ready for pickup!</h1>
        <p>Hi ${order.name},</p>
        <p>Great news! Your order is ready for Pickup!</p>
        <p>To arrange a pickup from our warehouse, please contact us directly and we can organize a time with you. Parted Euro is strictly open via appointment only and not open for public walk-ins.</p>
        <div class="contact-info">
            <p><strong>Contact us via:</strong></p>
            <p>Email: contact@partedeuro.com.au</p>
            <p>Call / Text: 0431 133 764</p>
        </div>
        <p><strong>Below is a summary of your order ${
          order.xeroInvoiceId
        }:</strong></p>
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${orderItemsHTML}
                <tr class="total-row">
                    <td colspan="3"><strong>Total:</strong></td>
                    <td>${formatCurrency(totalAmount)}</td>
                </tr>
            </tbody>
        </table>
        <p>Thanks again for shopping at Parted Euro!</p>
        <div class="footer">
            <p>If you have any questions, feel free to contact us directly.</p>
        </div>
    </div>
</body>
</html>
  `;
}

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendOrderShippedEmail = async (order: OrderWithItems) => {
  if (!order?.email) return;
  const { data, error } = await resend.emails.send({
    from: "contact@partedeuro.com.au",
    to: order?.email,
    subject: `Your Parted Euro Order ${order.xeroInvoiceId} has Shipped!`,
    html: generateOrderEmailHTML(order),
  });
  if (error) {
    console.error(error);
  }
  return data;
};

export const sendOrderReadyForPickupEmail = async (order: OrderWithItems) => {
  if (!order?.email) return;
  const { data, error } = await resend.emails.send({
    from: "contact@partedeuro.com.au",
    to: order?.email,
    subject: `Your Parted Euro Order ${order.xeroInvoiceId} is ready for pickup!`,
    html: generatePickupOrderEmailHTML(order),
  });
  if (error) {
    console.error(error);
  }
  return data;
};

export const sendNewOrderEmail = async (order: Order) => {
  const { data, error } = await resend.emails.send({
    from: "contact@partedeuro.com.au",
    to: "contact@partedeuro.com.au",
    subject: `Yo!!! New order ${order.xeroInvoiceId} placed!`,
    react: <NewOrderEmail order={order} />,
  });
  if (error) {
    console.error(error);
  }
  return data;
};
