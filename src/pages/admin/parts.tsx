import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import { trpc } from "../../utils/trpc";
import AddPart from "../../components/parts/AddPart";

const Parts: NextPage = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        {showModal ? (
          <AddPart showModal={showModal} setShowModal={setShowModal} />
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
