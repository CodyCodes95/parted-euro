import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import AddPartDetails from "../../components/parts/AddPartDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../utils/trpc";
import { PartDetail } from "@prisma/client";
import SortedTable from "../../components/tables/SortedTable";

const Inventory: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [headCells, setHeadCells] = useState<readonly string[]>([]);
  const [rows, setRows] = useState<PartDetail[]>([]);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const partDetails = trpc.partDetails.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setHeadCells([]);
      setRows([]);
      const hideColumns = ["id", "createdAt", "updatedAt"];
      setHeadCells((): any => {
        const cells = Object.keys(data[0] as PartDetail)
          .filter((key) => {
            return !hideColumns.includes(key);
          })
          .map((key: any) => {
            return {
              disablePadding: false,
              id: key,
              numeric: false,
              label: key,
            };
          });
        return cells;
      });
      data?.forEach((partDetail) => {
        setRows((prev) => [...prev, partDetail]);
      });
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
          <AddPartDetails
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
        <SortedTable
          headCells={headCells}
          rows={rows}
          title="Part Details"
          setShowModal={setShowModal}
          rowId={"partNo"}
        />
        <div className="flex w-full flex-wrap items-center justify-center p-8"></div>
      </main>
    </>
  );
};

export default Inventory;
