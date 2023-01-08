import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AddListing from "../../../components/listings/AddListing";
import { trpc } from "../../../utils/trpc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Listings: NextPage = () => {
  const [showModal, setShowModal] = useState(false);

    const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  
  

  return (
    <>
      <Head>
        <title>Listings</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <div>
          {showModal ? (
            <AddListing
              success={success}
              error={error}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          ) : null}
        </div>
        <button onClick={() => setShowModal(!showModal)}>Add Listing</button>
        <div className="flex w-full flex-wrap items-center justify-center p-8"></div>
      </main>
    </>
  );
};

export default Listings;
