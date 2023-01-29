import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../utils/trpc";
import { Part } from "@prisma/client";
import SortedTable from "../../components/tables/SortedTable";
import AddPart from "../../components/parts/AddPart";

const Inventory: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [headCells, setHeadCells] = useState<readonly string[]>([]);
  const [rows, setRows] = useState<Part[]>([]);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.parts.getAll.useQuery(undefined, {
    onSuccess: (data) => {
   
    },
  });

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <ToastContainer />
        {showModal ? (
          <AddPart
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
    
      </main>
    </>
  );
};

export default Inventory;
