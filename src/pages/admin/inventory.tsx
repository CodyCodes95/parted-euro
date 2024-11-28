import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type AllPartsQuery,
  type QueryListingsGetAllAdmin,
  trpc,
} from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import type { Part } from "@prisma/client";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import AddInventory from "../../components/inventory/AddInventory";
import EditInventoryModal from "../../components/inventory/EditInventory";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Edit, Edit2, ExternalLink, Trash2 } from "lucide-react";
import AddListing from "@/components/listings/AddListing";

const Inventory: NextPage = () => {
  useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useQueryState(
    "showModal",
    parseAsBoolean.withDefault(false),
  );
  const [selected, setSelected] = useState<Part | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [selectedPartToEdit, setSelectedPartToEdit] = useState<
    Part | undefined
  >();
  const [showOnlyUnlisted, setShowOnlyUnlisted] = useState(false);
  const [listingToCreate, setListingToCreate] =
    useState<QueryListingsGetAllAdmin>();
  const router = useRouter();

  const { vin } = router.query;

  const parts = trpc.parts.getAll.useQuery({ vin: (vin as string) || "" });
  const deletePart = trpc.parts.deletePart.useMutation();

  const partsFiltered = useMemo(() => {
    if (!parts.data) return parts;
    const filtered = parts.data.filter((part) => {
      if (!showOnlyUnlisted) return true;
      return part.listing.length === 0;
    });
    return {
      ...parts,
      data: filtered,
    };
  }, [parts, showOnlyUnlisted]);

  const columns = useMemo<Array<Column<AllPartsQuery>>>(
    () => [
      {
        Header: "Part",
        // TODO: Ts ignoring, I think new Tanstack table allows for types like this?
        // @ts-expect-error: bad types
        accessor: "partDetails.name",
      },
      {
        Header: "Partno",
        // @ts-expect-error: bad types
        accessor: "partDetails.partNo",
      },
      {
        Header: "Location",
        // @ts-expect-error: bad types
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
        Header: "Listed",
        accessor: (d) => <p>{d.listing.length ? "Yes" : "No"}</p>,
      },
      {
        Header: "Edit",
        accessor: (d: Part) => (
          <Button
            variant={"outline"}
            onClick={() => {
              setSelectedPartToEdit(d);
            }}
          >
            <Edit className="text-black" />
          </Button>
        ),
      },
      {
        Header: "Add listing",
        accessor: (d) => {
          if (!!d.listing.length) return null;
          return (
            <Button
              variant={"outline"}
              onClick={() => {
                console.log(d.partDetails.name);
                setListingToCreate({
                  // @ts-expect-error: bad types
                  parts: [{ id: d.id }],
                  title: d.partDetails.name,
                });
              }}
            >
              <ExternalLink className="text-black" />
            </Button>
          );
        },
      },
      {
        Header: "Delete",
        accessor: (d: Part) => (
          <Button
            variant={"outline"}
            onClick={() => {
              setSelected(d);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 className="text-red-500" />
          </Button>
        ),
      },
    ],
    [],
  );

  const deletePartFunc = async () => {
    if (!selected) return;
    await deletePart.mutateAsync({ id: selected.id });
    toast.success("Part deleted successfully");
    void parts.refetch();
    setShowDeleteModal(false);
    setSelected(undefined);
  };

  return (
    <>
      <Head>
        <title>Admin - Inventory</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            inventory: [
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
        {showModal ? (
          <AddInventory
            isOpen={showModal}
            onClose={() => {
              setSelected(undefined);
              void parts.refetch();
              void setShowModal(false);
            }}
          />
        ) : null}
        {!!listingToCreate && (
          <AddListing
            showModal={!!listingToCreate}
            setShowModal={() => setListingToCreate(undefined)}
            listing={listingToCreate}
            refetch={parts.refetch}
          />
        )}
        {selectedPartToEdit && (
          <EditInventoryModal
            isOpen={!!selectedPartToEdit}
            onClose={() => setSelectedPartToEdit(undefined)}
            inventoryItem={selectedPartToEdit}
            existingDonor={selectedPartToEdit.donorVin!}
          />
        )}
        <ConfirmDelete
          deleteFunction={deletePartFunc}
          setShowModal={setShowDeleteModal}
          showModal={showDeleteModal}
        />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowModal(true)}>
              Add Inventory Item
            </Button>
            <div className="flex items-center gap-2">
              <label htmlFor="listed-toggle" className="text-sm font-medium">
                Show unlisted parts only
              </label>
              <Switch
                id="listed-toggle"
                checked={showOnlyUnlisted}
                onCheckedChange={setShowOnlyUnlisted}
              />
            </div>
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
          data={partsFiltered}
        />
      </main>
    </>
  );
};

export default Inventory;
