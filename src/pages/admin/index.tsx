import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { IoCarSharp, IoBuildSharp } from "react-icons/io5";
import { FaDatabase, FaFileInvoice, FaImage, FaTag } from "react-icons/fa";
import xero from "../../../public/xero.png";
import { trpc } from "../../utils/trpc";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import { Image, ListOrdered } from "lucide-react";

const Admin: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const router = useRouter();

  const { code } = router.query;

  // const daysTillExpiry = trpc.xero.getExpiry.useQuery();

  const authenticateXero = trpc.xero.authenticate.useMutation();

  const renewToken = trpc.xero.updateTokenset.useMutation();

  const onRenew = async () => {
    const result = await authenticateXero.mutateAsync();
    if (result) {
      void router.push(result);
    }
  };

  const renewXero = async () => {
    const renewXeroRes = await renewToken.mutateAsync({
      code: window.location.href,
    });
    if (renewXeroRes.error) {
      toast.error(
        "Error renewing Xero token. Please try again. Error:" +
          renewXeroRes.error,
      );
    } else {
      toast.success("Xero token renewed");
    }
    void router.replace("/admin", undefined, { shallow: true });
  };

  useEffect(() => {
    if (code) {
      void renewXero();
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Admin</title>
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center justify-center">
        <BreadCrumbs />
        <section className="w-full bg-white py-10 sm:py-16 lg:py-24">
          <div className="mx-auto w-[50%] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-2 lg:gap-y-16">
              <Link
                href="/admin/data"
                className="w-full cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <FaDatabase className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Data</h3>
              </Link>
              <Link
                href="/admin/donors"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <IoCarSharp className="text-5xl" />
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
                  <IoBuildSharp className="text-5xl" />
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
                  <FaTag className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Listings
                </h3>
              </Link>
              <Link
                href="/admin/orders"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <FaFileInvoice className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Orders
                </h3>
              </Link>
              <Link
                href="/adminp/settings?tab=website"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <FaImage className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Images
                </h3>
              </Link>
            </div>
          </div>
        </section>
        <div className="flex w-[25%] items-center justify-around">
          <img src={xero.src} className="w-24" alt="Xero logo" />
          <div className="p-4"></div>
          <div className="flex flex-col items-center">
            <p className="text-xl">0 Days until Xero expiry.</p>
            <div className="p-2"></div>
            <button className="hover:underline" onMouseDown={onRenew}>
              Renew token
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Admin;
