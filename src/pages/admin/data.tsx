import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { IoCarSharp, IoBuildSharp } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { MdCategory } from "react-icons/md";
import BreadCrumbs from "../../components/admin/BreadCrumbs";

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
        <title>Admin -Data</title>
      </Head>
      <div className="p-20" />
      <main className="flex min-h-screen w-full flex-col items-center">
        <BreadCrumbs
          selectOptions={{
            data: [
              "donors",
              "data",
              "inventory",
              "listings",
              "orders",
              "categories",
              "parts",
              "cars",
            ],
          }}
        />
        <section className="w-full bg-white py-10 sm:py-16 lg:py-24">
          <div className="mx-auto w-[50%] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-2 lg:gap-y-16">
              <Link
                href="/admin/cars"
                className="w-full cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <IoCarSharp className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Cars</h3>
              </Link>
              <Link
                href="/admin/parts"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <IoBuildSharp className="text-5xl" />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-black">Parts</h3>
              </Link>
              <Link
                href="/admin/categories"
                className="cursor-pointer duration-150 ease-linear hover:scale-[1.2]"
              >
                <div className="relative mx-auto flex items-center justify-center">
                  <MdCategory className="text-5xl" />
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
