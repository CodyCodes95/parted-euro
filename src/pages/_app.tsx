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
import { useRouter } from "next/router";
import { useEffect } from "react";
import Script from "next/script";

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

// Initialize Facebook Pixel
const FacebookPixel = () => {
  const router = useRouter();

  useEffect(() => {
    // Initialize Facebook Pixel when component mounts
    if (typeof window !== "undefined") {
      void import("react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init("YOUR_PIXEL_ID_HERE"); // Replace with your Pixel ID
          ReactPixel.pageView();

          // Track page views on route changes
          router.events.on("routeChangeComplete", () => {
            ReactPixel.pageView();
          });
        });
    }
  }, [router.events]);

  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1009808854280120');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* Noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Analytics />
      <FacebookPixel />
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
