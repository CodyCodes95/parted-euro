import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import BuildIcon from "@mui/icons-material/Build";
import { useSession } from "next-auth/react";
import Spacer from "../../../components/Spacer";
import { MdCategory } from "react-icons/md";
import BreadCrumbs from "../../../components/BreadCrumbs";

const Data: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  return (
    <>
      <Head>
        <title>Data</title>
      </Head>
      <div className="p-20" />
      <main className="flex min-h-screen w-full flex-col items-center">
      <BreadCrumbs />
        <section className="w-full bg-white py-10 sm:py-16 lg:py-24">
          <div className="mx-auto w-[50%] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-2 lg:gap-y-16">
              <Link
                href="/admin/data/cars"
                className="w-full cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <TimeToLeaveIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Cars</h3>
              </Link>
              <Link
                href="/admin/data/parts"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <BuildIcon fontSize="large" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Parts</h3>
              </Link>
              <Link
                href="/admin/data/categories"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <MdCategory className="text-4xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">
                  Categories
                </h3>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Data;
