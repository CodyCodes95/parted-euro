import { type NextPage } from "next";
import Head from "next/head";
import React from "react";

import { trpc } from "../../utils/trpc";
import AddOrigin from "../../components/origins/AddOrigin";

const Origins: NextPage = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        {showModal ? (
          <AddOrigin showModal={showModal} setShowModal={setShowModal} />
        ) : null}
        <div>
          <button onClick={() => setShowModal(!showModal)}>Add Origin</button>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center p-8"></div>
      </main>
    </>
  );
};

export default Parts;
