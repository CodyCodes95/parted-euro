import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import Footer from "../components/Footer";
import { CartProvider } from "../context/cartContext";
import Nav from "../components/Nav";
import { Toaster } from "sonner";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <CartProvider>
      <SessionProvider session={session}>
        <Toaster position="bottom-right" />
        <Nav />
        <Component {...pageProps} />
        <Footer />
      </SessionProvider>
    </CartProvider>
  );
};

export default trpc.withTRPC(MyApp);
