import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import AddCar from "../../../components/cars/AddCar";
import loader from "../../../../public/loader.svg";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";
import type { Car } from "@prisma/client";
import Spacer from "../../../components/Spacer";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Cars: NextPage = () => {
    const { status } = useSession({
      required: true,
      onUnauthenticated() {
        window.location.href = "/";
      },
    });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [filter, setFilter] = useState<string>("");

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const cars = trpc.cars.getAll.useQuery();
  const deleteCar = trpc.cars.deleteCar.useMutation();

  const deleteCarFunction = async () => {
    if (selectedCar) {
      await deleteCar.mutateAsync({ id: selectedCar.id });
      setShowDeleteModal(false);
    }
  };

  const tableData = useMemo(() => cars.data, [cars.data]);

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Series",
        accessor: "series",
      },
      {
        Header: "Generation",
        accessor: "generation",
      },
      {
        Header: "Model",
        accessor: "model",
      },
      {
        Header: "Body",
        accessor: "body",
      },
      {
        Header: "Edit Car",
        accessor: (d: Car) => (
          <button
            onClick={() => {
              setSelectedCar(d);
              setShowModal(true);
            }}
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Edit Car
          </button>
        ),
      },
      {
        Header: "Delete Car",
        accessor: (d: Car) => (
          <button
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              setSelectedCar(d);
              setShowDeleteModal(true);
            }}
          >
            Delete Car
          </button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <ConfirmDelete
        deleteFunction={deleteCarFunction}
        setShowModal={setShowDeleteModal}
        showModal={showDeleteModal}
      />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <div className="flex items-center">
          <Link
            href="/admin/data"
            className="mr-2 mb-2 w-fit rounded-lg border border-gray-800 px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-800"
          >
            {"<"}
          </Link>
          <Spacer amount="2" />
          <p className="text-xl">admin/data/cars</p>
        </div>
        <Spacer amount="2" />
        {showModal ? (
          <AddCar
            car={selectedCar}
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            refetch={cars.refetch}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                setSelectedCar(null);
                setShowModal(true);
              }}
            >
              Add Car
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
              placeholder="Search for cars"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        {cars.isLoading ? (
          <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
            <img className="h-60 w-60" src={loader.src} alt="Loading spinner" />
          </div>
        ) : (
          <AdminTable columns={columns} data={cars.data}  filter={filter} setFilter={setFilter}/>
        )}
      </main>
    </>
  );
};

export default Cars;
