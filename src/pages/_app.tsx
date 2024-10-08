import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import { cn } from "../lib/utils";
import { Analytics } from "@vercel/analytics/react";

const geist = localFont({
  src: [
    { path: "../../public/fonts/Geist/Geist-Regular.otf", weight: "500" },
    { path: "../../public/fonts/Geist/Geist-Medium.otf", weight: "600" },
    { path: "../../public/fonts/Geist/Geist-SemiBold.otf", weight: "700" },
    { path: "../../public/fonts/Geist/Geist-Bold.otf", weight: "800" },
    { path: "../../public/fonts/Geist/Geist-Black.otf", weight: "900" },
  ],
  display: "swap",
  variable: "--font-geist-sans",
  fallback: ["sans-serif"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Analytics />
      <Toaster position="bottom-right" richColors />
      <main className={cn(geist.variable, "font-sans")}>
        <Nav />
        <Component {...pageProps} />
        <Footer />
      </main>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
