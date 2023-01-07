import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import AddPartDetails from "../../components/parts/AddPartDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Parts: NextPage = () => {
  const [showModal, setShowModal] = React.useState(false);

    const success = (message: string) => toast.success(message);
    const error = (message: string) => toast.error(message);

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <ToastContainer />
        {showModal ? (
          <AddPartDetails
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
        <div>
          <button onClick={() => setShowModal(!showModal)}>Add Part</button>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center p-8"></div>
      </main>
    </>
  );
};

export default Parts;
