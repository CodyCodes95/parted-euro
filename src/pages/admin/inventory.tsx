import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AllPartsQuery, trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import type { Part } from "@prisma/client";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import AddInventory from "../../components/inventory/AddInventory";
import EditInventoryModal from "../../components/inventory/EditInventory";

const Inventory: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<Part | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [selectedPartToEdit, setSelectedPartToEdit] = useState<
    Part | undefined
  >();

  const router = useRouter();

  const { vin } = router.query;


  const parts = trpc.parts.getAll.useQuery({ vin: (vin as string) || "" });
  const deletePart = trpc.parts.deletePart.useMutation();

  const columns = useMemo<Array<Column<AllPartsQuery>>>(
    () => [
      {
        Header: "Part",
        // TODO: Ts ignoring, I think new Tanstack table allows for types like this?
        // @ts-ignore
        accessor: "partDetails.name",
      },
      {
        Header: "Partno",
        // @ts-ignore
        accessor: "partDetails.partNo",
      },
      {
        Header: "Location",
        // @ts-ignore
        accessor: "inventoryLocation.name",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
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
        Header: "Edit",
        accessor: (d: Part) => (
          <Button
            onClick={() => {
              setSelectedPartToEdit(d);
            }}
          >
            Edit Part
          </Button>
        ),
      },
      {
        Header: "Delete",
        accessor: (d: Part) => (
          <Button
            variant={"destructive"}
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
    toast.success("Part deleted successfully");
    parts.refetch();
    setShowDeleteModal(false);
    setSelected(undefined);
  };

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
        {showModal ? (
          <AddInventory
            isOpen={showModal}
            onClose={() => {
              parts.refetch();
              setSelected(undefined);
              setShowModal(false);
            }}
          />
        ) : null}
        {selectedPartToEdit && (
          <EditInventoryModal
            isOpen={!!selectedPartToEdit}
            onClose={() => setSelectedPartToEdit(undefined)}
            inventoryItem={selectedPartToEdit}
            existingDonor={selectedPartToEdit.donorVin as string}
          />
        )}
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
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for parts..."
          />
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
