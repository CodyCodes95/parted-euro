import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../utils/trpc";
import AddPart from "../../components/parts/AddPart";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import type { Part } from "@prisma/client";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import Link from "next/link";
import Spacer from "../../components/Spacer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";

const Inventory: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selected, setSelected] = useState<Part | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

  const router = useRouter();

  const { vin } = router.query;

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.parts.getAll.useQuery({ vin: (vin as string) || "" });
  const deletePart = trpc.parts.deletePart.useMutation();

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Part",
        accessor: "partDetails.name",
      },
      {
        Header: "Partno",
        accessor: "partDetails.partNo",
      },
      {
        Header: "Location",
        accessor: "inventoryLocation.name",
      },
      {
        Header: "Variant",
        accessor: "variant",
      },
      {
        Header: "Donor",
        accessor: "donorVin",
      },
      {
        Header: "Delete",
        accessor: (d: Part) => (
          <Button
            onClick={() => {
              setSelected(d);
              setShowDeleteModal(true);
            }}
          >
            Delete Part
          </Button>
        ),
      },
    ],
    []
  );

  const deletePartFunc = async () => {
    if (!selected) return;
    await deletePart.mutateAsync({ id: selected.id });
    success("Part deleted successfully");
    parts.refetch();
    setShowDeleteModal(false);
    setSelected(null);
  };

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-2 mb-2 w-fit rounded-lg border border-gray-800 px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-800"
          >
            {"<"}
          </Link>
          <Spacer amount="2" />
          <p className="text-xl">admin/inventory</p>
        </div>
        {showModal ? (
          <AddPart
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            part={selected}
            refetch={parts.refetch}
          />
        ) : null}
        <ConfirmDelete
          deleteFunction={deletePartFunc}
          setShowModal={setShowDeleteModal}
          showModal={showDeleteModal}
        />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <Button onClick={() => setShowModal(true)}>
              Add Inventory Item
            </Button>
          </div>
          <FilterInput filter={filter} setFilter={setFilter} placeholder="Search for parts..." />
        </div>
        <AdminTable
          columns={columns}
          filter={filter}
          setFilter={setFilter}
          data={parts}
        />
      </main>
    </>
  );
};

export default Inventory;
