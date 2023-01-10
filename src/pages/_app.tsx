import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@material-tailwind/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { CartProvider } from "../context/cartContext";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
        <CartProvider>
    <SessionProvider session={session}>
      <ThemeProvider>
          <Nav />
          <Component {...pageProps} />
          <Footer />
      </ThemeProvider>
    </SessionProvider>
        </CartProvider>
  );
};

export default trpc.withTRPC(MyApp);
