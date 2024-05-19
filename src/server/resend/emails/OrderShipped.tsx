import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Row,
  Column,
  Section,
} from "@react-email/components";
import * as React from "react";
import type { OrderWithItems } from "../../../utils/trpc";

type OrderShippedEmailprops = {
  order: OrderWithItems;
};

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const OrderShippedEmail = ({ order }: OrderShippedEmailprops) => (
  <Html>
    <Head />
    <Preview>Your order is has shipped!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/_next/static/media/logo.2d624463.png`}
          width="160"
          height="32"
          alt="Parted Euro's Logo"
        />
        <Text style={{ ...text }}>Hi {order!.name},</Text>
        <Text style={{ ...text, marginBottom: "14px" }}>
          Great news! Your order is has shipped!
        </Text>
        <Text style={{ ...text, margin: "0px" }}>
          Tracking number: {order?.trackingNumber}
        </Text>
        <Text style={{ ...text }}>Carrier: AusPost</Text>
        <Text style={{ ...text, fontWeight: "bold" }}>
          Below is a summary of your order {order!.xeroInvoiceId}:
        </Text>
        <Section>
          {order!.orderItems.map((item, index) => {
            if (index === 0) {
              return (
                <Row key={item.id}>
                  <Column>
                    <Text style={{ ...text }}></Text>
                    <Img
                      src={item.listing.images[0]?.url}
                      width="60"
                      height="60"
                      alt="Product Image"
                    />
                  </Column>
                  <Column>
                    <Text style={{ ...text }}>Item</Text>
                    <Text style={{ ...text }}>{item.listing.title}</Text>
                  </Column>
                  <Column>
                    <Text style={{ ...text }}>Price</Text>
                    <Text style={{ ...text }}>${item.listing.price}</Text>
                  </Column>
                  <Column>
                    <Text style={{ ...text }}>Quantity</Text>
                    <Text style={{ ...text }}>{item.quantity}</Text>
                  </Column>
                </Row>
              );
            }
            return (
              <Row key={item.id}>
                <Column>
                  <Img
                    src={item.listing.images[0]?.url}
                    width="60"
                    height="60"
                    alt="Product Image"
                  />
                </Column>
                <Column>
                  <Text style={{ ...text }}>{item.listing.title}</Text>
                </Column>
                <Column>
                  <Text style={{ ...text }}>${item.listing.price}</Text>
                </Column>
                <Column>
                  <Text style={{ ...text }}>{item.quantity}</Text>
                </Column>
              </Row>
            );
          })}
        </Section>
        <Text style={{ ...text, margin: "0px" }}>
          Shipping: ${order?.shipping}
        </Text>
        <Text style={{ ...text, margin: "0px", marginBottom: "14px" }}>
          Total: ${(order?.subtotal ?? 0) / 100}
        </Text>
        <Text style={{ ...text }}>
          Thanks again for shopping at Parted Euro!
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderShippedEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const footer = {
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};

const code = {
  display: "inline-block",
  padding: "16px 4.5%",
  width: "90.5%",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
};
