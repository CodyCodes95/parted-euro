import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import CarRepairIcon from "@mui/icons-material/CarRepair";
import BuildIcon from "@mui/icons-material/Build";
import SellIcon from "@mui/icons-material/Sell";
import xero from "../../../public/xero.png";
import { trpc } from "../../utils/trpc";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const router = useRouter();

  const { code } = router.query;

  const daysTillExpiry = trpc.xero.getExpiry.useQuery();

  const authenticateXero = trpc.xero.authenticate.useMutation();

  const renewToken = trpc.xero.updateRefreshToken.useMutation();

  const onRenew = async () => {
    const result = await authenticateXero.mutateAsync();
    if (result) {
      router.push(result.url);
    }
  };

  const renewXero = async () => {
    toast.loading("Renewing Xero token...")
    const renewXeroRes = await renewToken.mutateAsync({
      code: window.location.href,
    });
    if (renewXeroRes.error) {
      toast.error(
        "Error renewing Xero token. Please try again. Error:",
        renewXeroRes.error
      );
    } else {
      toast.success("Xero token renewed");
    }
    router.replace("/admin", undefined, { shallow: true });
  };

  useEffect(() => {
    if (code) {
      renewXero();
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Admin</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <main className="flex min-h-screen w-full flex-col items-center justify-center">
        <section className="w-full bg-white py-10 sm:py-16 lg:py-24">
          <div className="mx-auto w-[50%] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-2 lg:gap-y-16">
              <Link
                href="/admin/data"
                className="w-full cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <TimeToLeaveIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Data</h3>
              </Link>
              <Link
                href="/admin/donors"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <CarRepairIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Donors
                </h3>
              </Link>
              <Link
                href="/admin/inventory"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <BuildIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Inventory
                </h3>
              </Link>
              <Link
                href="/admin/listings"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <SellIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Listings
                </h3>
              </Link>
            </div>
          </div>
        </section>
        <div className="flex w-[25%] items-center justify-around">
          <img src={xero.src} className="w-24" alt="Xero logo" />
          <div className="p-4"></div>
          <div className="flex flex-col items-center">
            <p className="text-xl">
              {daysTillExpiry.data?.daysTillExpiry} Days until Xero expiry.
            </p>
            <div className="p-2"></div>
            <button className="hover:underline" onClick={onRenew}>
              Renew token
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Admin;
