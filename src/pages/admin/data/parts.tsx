import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import AddPartDetails from "../../../components/parts/AddPartDetails";
import { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";
import EditPartDetails from "../../../components/parts/EditPartDetails";

const Inventory: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selection, setSelection] = useState<any>(null);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.partDetails.getAll.useQuery();
  const deletePart = trpc.partDetails.deletePartDetail.useMutation({
    onError: (err: any) => {
      error(err.message);
    },
  });

  const tableData = useMemo(() => parts.data, [parts.data]);

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Part",
        accessor: "name",
      },
      {
        Header: "Partno",
        accessor: "partNo",
      },
      {
        Header: "Type",
        accessor: "partType.name",
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <button
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={() => {
              setSelection(d)
              setShowEditModal(true)
            }
            }
          >
            Edit
          </button>
        ),
      },
    ],
    []
  );

  const deleteSelections = async () => {
    const deletePromises = selectedRows.map((row) =>
      deletePart.mutateAsync({ partNo: row })
    );
    await Promise.all(deletePromises);
  };

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        {showConfirmDelete ? (
          <ConfirmDelete
            showModal={showConfirmDelete}
            setShowModal={setShowConfirmDelete}
            deleteFunction={deleteSelections}
          />
        ) : null}
        {showModal ? (
          <AddPartDetails
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
        {showEditModal ? (
          <EditPartDetails
            success={success}
            error={error}
            showModal={showEditModal}
            setShowModal={setShowEditModal}
            selection={selection}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
           
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => setShowModal(true)}
            >
              Add Part
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
              placeholder="Search for parts"
            />
          </div>
        </div>
        {parts.isLoading ? (
          <p>Loading</p>
        ) : (
          <AdminTable
            id={"partNo"}
            columns={columns}
            setSelectedRows={setSelectedRows}
            data={parts.data}
          />
        )}
      </main>
    </>
  );
};

export default Inventory;
