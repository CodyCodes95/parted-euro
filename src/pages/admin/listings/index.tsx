import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import ListingTable from "../../../components/tables/ListingTable";
import AddListing from "../../../components/listings/AddListing";
import { useRouter } from "next/router";
import Link from "next/link";
import loader from "../../../../public/loader.svg";
import AdminTable from "../../../components/tables/AdminTable";
import { Column } from "react-table";
import { Listing } from "@prisma/client";
import EbayModal from "../../../components/listings/EbayModal";

const Listings: NextPage = () => {
  const router = useRouter();

  const { code } = router.query;

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [showEbayModal, setShowEbayModal] = useState(false);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const listings = trpc.listings.getAllAdmin.useQuery();
  const ebayLogin = trpc.ebay.authenticate.useMutation();
  const updateRefreshToken = trpc.ebay.updateRefreshToken.useMutation();

   const columns = useMemo<Array<Column<any>>>(
     () => [
       {
         Header: "Title",
         accessor: "title",
       },
       {
         Header: "Price",
         accessor: "price",
       },
       {
         Header: "Listed On Ebay",
         accessor: (d) =>
           d.ebayListing ? (
             <button className="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
               View Ebay Listing
             </button>
           ) : (
             <button
               onClick={() => {
                 setShowEbayModal(true);
                 setSelected(d);
               }}
               className="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
             >
               List on eBay
             </button>
           ),
       },
       {
         Header: "Listed On",
         accessor: (d) => d.createdAt.toLocaleString(),
       },
     ],
     []
   );

  const authenticateEbay = async () => {
    const result = await ebayLogin.mutateAsync();
    if (result) {
      router.push(result.url);
    }
  };

  useEffect(() => {
    if (code) {
      const updateTokenRes = updateRefreshToken.mutateAsync({
        code: code as string,
      });
      console.log(updateTokenRes);
      router.replace("/admin/listings", undefined, { shallow: true });
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Listings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        {showModal ? (
          <AddListing
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
        {showEbayModal ? (
          <EbayModal
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            listing={selected}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => setShowModal(true)}
            >
              Add Listing
            </button>
          </div>
          <label className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="table-search-users"
              className="block w-80 rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search for listings"
            />
          </div>
        </div>
        {listings.isLoading ? (
          <div className="flex min-h-screen w-full items-center justify-center">
            <img className="h-80 w-80" src={loader.src} alt="Loading spinner" />
          </div>
        ) : (
          <AdminTable id="id" columns={columns} data={listings.data} />
        )}
        <div>
          <button
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={authenticateEbay}
          >
            Renew Ebay
          </button>
          <Link
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            href="/admin/ebay"
          >
            Ebay Dashboard
          </Link>
        </div>
      </main>
    </>
  );
};

export default Listings;
