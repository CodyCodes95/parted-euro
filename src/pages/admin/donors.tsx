import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import {  toast } from "react-toastify";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import AddDonor from "../../components/donors/AddDonor";
import { formatPrice } from "../../utils/formatPrice";
import AddPart from "../../components/parts/AddPart";
import type { Donor } from "@prisma/client";
import { useSession } from "next-auth/react";
import BreadCrumbs from "../../components/BreadCrumbs";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";

const Donors: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPartModal, setShowPartModal] = useState<boolean>(false);
  const [donorVin, setDonorVin] = useState<string>("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

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
        accessor: (d) => (
          <a
            className="text-blue-400 hover:underline"
            href={`/admin/inventory?vin=${d.vin}`}
          >
            {d.parts.length} parts
          </a>
        ),
      },
      {
        Header: "Total Unsold Parts",
        accessor: (d) => (
          <>
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
            <Progress
              value={d.parts.reduce((acc: any, part: any) => {
                if (part.soldPrice === null || !part.sold) return acc;
                return part.soldPrice + acc;
              }, 0) / d.cost * 100 || 0}
              className="h-6 rounded-md"
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
          <Button
            onClick={() => {
              setDonorVin(d.vin);
              setShowPartModal(true);
            }}
          >
            Add Parts
          </Button>
        ),
        disableSortBy: true,
        minWidth: 100,
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelectedDonor(d);
              setShowModal(true);
            }}
          >
            Edit Donor
          </Button>
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
          onError: (err) => {
            error(err.message);
          },
        }
      );
      success("Donor deleted successfully");
    }
  };

  return (
    <>
      <Head>
        <title>Donors</title>
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
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
            refetch={donors.refetch}
          />
        ) : null}
        {showPartModal ? (
          <AddPart
            refetch={donors.refetch}
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
              placeholder="Search for Donors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <AdminTable
          columns={columns}
          data={donors}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
    </>
  );
};

export default Donors;
