import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import AddDonor from "../../components/donors/AddDonor";
import { LinearProgress } from "@mui/material";
import { formatPrice } from "../../utils/formatPrice";
import AddPart from "../../components/parts/AddPart";
import loader from "../../../public/loader.svg";
import type { Donor } from "@prisma/client";

const Donors: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [donorVin, setDonorVin] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const donors = trpc.donors.getAllDashboard.useQuery();
  const deleteDonor = trpc.donors.deleteDonor.useMutation();

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "VIN",
        accessor: "vin",
      },
      {
        Header: "Year",
        accessor: "year",
      },
      {
        Header: "Mileage",
        accessor: "mileage",
      },
      {
        Header: "Model",
        accessor: "car.model",
      },
      {
        Header: "Generation",
        accessor: "car.generation",
      },
      {
        Header: "Series",
        accessor: "car.series",
      },
      {
        Header: "Cost",
        accessor: (d) => `$${d.cost}`,
      },
      {
        Header: "Parts",
        accessor: (d) => `${d.parts.length} Parts`,
      },
      {
        Header: "Total Unsold Parts",
        accessor: (d) => (
          <>
            <LinearProgress
              value={
                (d.parts
                  .reduce((acc: any, cur: any) => {
                    if (cur.listing.length === 0) return acc;
                    if (
                      !acc.some(
                        (part: any) => part.listing.id === cur.listing.id
                      )
                    ) {
                      acc.push(cur);
                    }
                    return acc;
                  }, [] as any[])
                  .reduce((acc: any, part: any) => {
                    if (part.sold) return acc;
                    const listingsTotal = part?.listing?.reduce(
                      (accum: number, listing: any) => {
                        if (listing.active) return accum + listing.price;
                        return accum;
                      },
                      0
                    );
                    return listingsTotal + acc;
                  }, 0) /
                  d.cost) *
                  100 || 0
              }
              variant="determinate"
              className="h-6 rounded-md bg-[#98d219a3]"
            />
            <p>
              {formatPrice(
                d.parts
                  .reduce((acc: any, cur: any) => {
                    if (cur.listing.length === 0) return acc;
                    if (
                      !acc.some(
                        (part: any) => part.listing.id === cur.listing.id
                      )
                    ) {
                      acc.push(cur);
                    }
                    return acc;
                  }, [] as any[])
                  .reduce((acc: any, part: any) => {
                    if (part.sold) return acc;
                    const listingsTotal = part?.listing?.reduce(
                      (accum: number, listing: any) => {
                        if (listing.active) return accum + listing.price;
                        return accum;
                      },
                      0
                    );
                    return listingsTotal + acc;
                  }, 0)
              ) || 0}
            </p>
          </>
        ),
      },
      {
        Header: "Total Sold Parts",
        accessor: (d) => (
          <>
            <LinearProgress
              value={d.parts.reduce((acc: any, part: any) => {
                if (part.soldPrice === null || !part.sold) return acc;
                return part.soldPrice + acc;
              }, 0)}
              variant="determinate"
              className="h-6 rounded-md bg-[#98d219a3]"
            />
            <p>
              {formatPrice(
                d.parts.reduce((acc: any, part: any) => {
                  if (part.soldPrice === null || !part.sold) return acc;
                  return part.soldPrice + acc;
                }, 0)
              )}
            </p>
          </>
        ),
      },
      {
        Header: "Add Parts",
        accessor: (d) => (
          <button
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              setDonorVin(d.vin);
              setShowPartModal(true);
            }}
          >
            Add Parts
          </button>
        ),
        disableSortBy: true,
        minWidth: 100,
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <button
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              setSelectedDonor(d);
              setShowModal(true);
            }}
          >
            Edit Donor
          </button>
        ),
      },
      {
        Header: "Delete",
        accessor: (d) => (
          <button
            className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              setSelectedDonor(d);
              setShowDeleteModal(true);
            }}
          >
            Delete Donor
          </button>
        ),
      },
    ],
    []
  );

  const deleteDonorFunc = async () => {
    if (selectedDonor) {
      await deleteDonor.mutateAsync(
        { vin: selectedDonor.vin },
        {
          onSuccess: () => {
            success("Donor deleted successfully");
          },
          onError: (err) => {
            error(err.message);
          },
        }
      );
    }
  };

  if (donors.isLoading) {
    return (
      <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
        <img className="h-80 w-80" src={loader.src} alt="Loading spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Donors</title>
      </Head>
      <ToastContainer />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        {showDeleteModal ? (
          <ConfirmDelete
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            deleteFunction={deleteDonorFunc}
          />
        ) : null}
        {showModal ? (
          <AddDonor
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            donor={selectedDonor}
          />
        ) : null}
        {showPartModal ? (
          <AddPart
            donorVin={donorVin}
            success={success}
            error={error}
            showModal={showPartModal}
            setShowModal={setShowPartModal}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                setSelectedDonor(null);
                setShowModal(true);
              }}
            >
              Add Donor
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
        {donors.isLoading ? (
          <p>Loading</p>
        ) : (
          <AdminTable id={"id"} columns={columns} data={donors.data} />
        )}
      </main>
    </>
  );
};

export default Donors;
