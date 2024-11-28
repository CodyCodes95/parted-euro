import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { QueryDonorGetAllDashboard} from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import AddDonor from "../../components/donors/AddDonor";
import { formatPrice } from "../../utils/formatPrice";
import { useSession } from "next-auth/react";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import FilterInput from "../../components/tables/FilterInput";
import AddInventory from "../../components/inventory/AddInventory";

const Donors: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [donorVin, setDonorVin] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<QueryDonorGetAllDashboard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filter, setFilter] = useState("");


  const donors = trpc.donors.getAllDashboard.useQuery();
  const deleteDonor = trpc.donors.deleteDonor.useMutation();

  const columns = useMemo<Array<Column<QueryDonorGetAllDashboard>>>(
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
             // TODO: Ts ignoring, I think new Tanstack table allows for types like this?
        // @ts-ignore
        accessor: "car.model",
      },
      {
        Header: "Generation",
        // @ts-ignore
        accessor: "car.generation",
      },
      {
        Header: "Series",
        // @ts-ignore
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
              value={
                (d.parts.reduce((acc: any, part: any) => {
                  if (part.soldPrice === null || !part.sold) return acc;
                  return part.soldPrice + acc;
                }, 0) /
                  d.cost) *
                  100 || 0
              }
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
          <Button
            onClick={() => {
              setSelectedDonor(d);
              setShowDeleteModal(true);
            }}
            variant="destructive"
          >
            Delete Donor
          </Button>
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
            toast.error(err.message);
          },
        }
      );
      toast.success("Donor deleted successfully");
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Donors</title>
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            donors: [
              "donors",
              "inventory",
              "listings",
              "orders",
              "categories",
              "parts",
              "cars",
            ],
          }}
        />
        {showDeleteModal ? (
          <ConfirmDelete
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            deleteFunction={deleteDonorFunc}
          />
        ) : null}
        {showModal ? (
          <AddDonor
            showModal={showModal}
            setShowModal={setShowModal}
            donor={selectedDonor}
            refetch={donors.refetch}
          />
        ) : null}
        {showPartModal ? (
          <AddInventory
            existingDonor={donorVin}
            isOpen={showPartModal}
            onClose={() => {
              donors.refetch();
              setSelectedDonor(null);
              setShowPartModal(false);
            }}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <Button
            onClick={() => {
              setSelectedDonor(null);
              setShowModal(true);
            }}
          >
            Add Donor
          </Button>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for donors..."
          />
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
