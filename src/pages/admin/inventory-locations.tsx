import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import { useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import BreadCrumbs from "../../components/admin/BreadCrumbs";

import type { InventoryLocations } from "@prisma/client";
import AddInventoryLocation from "@/components/inventory/AddInventoryLocation";
import FilterInput from "../../components/tables/FilterInput";

const InventoryLocations: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<
    InventoryLocations | undefined
  >();
  const [filter, setFilter] = useState<string>("");

  const locations = trpc.inventoryLocations.getAllLocations.useQuery();
  const deleteLocation = trpc.inventoryLocations.deleteLocation.useMutation({
    onSuccess: () => {
      void locations.refetch();
    },
  });

  const locationCols = useMemo<Array<Column<InventoryLocations>>>(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelectedLocation(d);
              setShowModal(true);
            }}
          >
            Edit
          </Button>
        ),
      },
      {
        Header: "Delete",
        accessor: (d) => (
          <Button
            variant="destructive"
            onClick={() => {
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
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            "inventory-locations": [
              "donors",
              "inventory",
              "inventory-locations",
              "listings",
              "orders",
              "categories",
              "parts",
              "cars",
            ],
          }}
        />
        <div className="flex items-center justify-between bg-white py-4">
          <Button
            onClick={() => {
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
