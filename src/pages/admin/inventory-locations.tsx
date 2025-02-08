import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import { useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import BreadCrumbs, { adminPages } from "../../components/admin/BreadCrumbs";
import { useRouter } from "next/router";
import Link from "next/link";

import type { InventoryLocations } from "@prisma/client";
import AddInventoryLocation from "@/components/inventory/AddInventoryLocation";
import MergeLocationModal from "@/components/inventory/MergeLocationModal";
import FilterInput from "../../components/tables/FilterInput";

const InventoryLocations: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<
    InventoryLocations | undefined
  >();
  const [selectedMergeLocation, setSelectedMergeLocation] = useState<
    (InventoryLocations & { _count: { parts: number } }) | undefined
  >();
  const [filter, setFilter] = useState<string>("");
  const router = useRouter();

  const locations = trpc.inventoryLocations.getAllLocations.useQuery();
  const deleteLocation = trpc.inventoryLocations.deleteLocation.useMutation({
    onSuccess: () => {
      void locations.refetch();
    },
  });

  const locationCols = useMemo<
    Array<Column<InventoryLocations & { _count: { parts: number } }>>
  >(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Parts",
        accessor: (d) => (
          <Link
            href={`/admin/inventory?filter=${encodeURIComponent(d.name)}`}
            className="cursor-pointer text-blue-500 hover:underline"
          >
            {d._count.parts}
          </Link>
        ),
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onMouseDown={() => {
              setSelectedLocation(d);
              setShowModal(true);
            }}
          >
            Edit
          </Button>
        ),
      },
      {
        Header: "Merge",
        accessor: (d) => (
          <Button
            variant="secondary"
            onMouseDown={() => {
              setSelectedMergeLocation(d);
              setShowMergeModal(true);
            }}
          >
            Merge
          </Button>
        ),
      },
      {
        Header: "Delete",
        accessor: (d) => (
          <Button
            variant="destructive"
            onMouseDown={() => {
              if (confirm("Are you sure you want to delete this location?")) {
                deleteLocation.mutate({ id: d.id });
              }
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteLocation],
  );

  return (
    <>
      <Head>
        <title>Admin - Inventory Locations</title>
      </Head>
      {showModal && (
        <AddInventoryLocation
          refetch={locations.refetch}
          setShowModal={setShowModal}
          showModal={showModal}
          selection={selectedLocation}
        />
      )}
      {showMergeModal && selectedMergeLocation && locations.data && (
        <MergeLocationModal
          showModal={showMergeModal}
          setShowModal={setShowMergeModal}
          sourceLocation={selectedMergeLocation}
          locations={locations.data}
          refetch={locations.refetch}
        />
      )}
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            "inventory-locations": adminPages,
          }}
        />
        <div className="flex items-center justify-between bg-white py-4">
          <Button
            onMouseDown={() => {
              setSelectedLocation(undefined);
              setShowModal(true);
            }}
          >
            Add Location
          </Button>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search locations..."
          />
        </div>
        <AdminTable
          columns={locationCols}
          data={locations}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
    </>
  );
};

export default InventoryLocations;
