import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type AllPartDetailsQuery, trpc } from "../../utils/trpc";
import AddPartDetails from "../../components/partDetails/AddPartDetails";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import EditPartDetails from "../../components/partDetails/EditPartDetails";
import { useSession } from "next-auth/react";
import FilterInput from "../../components/tables/FilterInput";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import { Button } from "../../components/ui/button";

const Inventory: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<AllPartDetailsQuery | null>(
    null,
  );
  const [filter, setFilter] = useState<string>("");

  const parts = trpc.partDetails.getAll.useQuery();
  const deletePart = trpc.partDetails.deletePartDetail.useMutation({
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const columns = useMemo<Array<Column<AllPartDetailsQuery>>>(
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
        Header: "Alternate Part Numbers",
        accessor: (d) => d.alternatePartNumbers?.replaceAll(",", ", "),
      },
      {
        Header: "Weight",
        accessor: "weight",
      },
      {
        Header: "Length",
        accessor: "length",
      },
      {
        Header: "Width",
        accessor: "width",
      },
      {
        Header: "Height",
        accessor: "height",
      },
      {
        Header: "Type",
        accessor: (d) => d.partTypes.map((type) => type.name).join(", "),
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelectedPart(d);
              setShowEditModal(true);
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
            onClick={() => {
              setSelectedPart(d);
              setShowConfirmDelete(true);
            }}
            variant="destructive"
          >
            Delete
          </Button>
        ),
      },
    ],
    [parts.data],
  );

  const deletePartDetailFunc = async () => {
    if (selectedPart) {
      await deletePart.mutateAsync({ partNo: selectedPart.partNo });
      void parts.refetch();
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            parts: [
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
        {showConfirmDelete ? (
          <ConfirmDelete
            showModal={showConfirmDelete}
            setShowModal={setShowConfirmDelete}
            deleteFunction={deletePartDetailFunc}
          />
        ) : null}
        {showModal ? (
          <AddPartDetails
            showModal={showModal}
            setShowModal={setShowModal}
            refetch={parts.refetch}
          />
        ) : null}
        {showEditModal && selectedPart ? (
          <EditPartDetails
            showModal={showEditModal}
            setShowModal={setShowEditModal}
            selection={selectedPart}
            refetch={parts.refetch}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <Button onClick={() => setShowModal(true)}>Add Part</Button>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for parts..."
          />
        </div>
        <AdminTable
          filter={filter}
          setFilter={setFilter}
          columns={columns}
          data={parts}
        />
      </main>
    </>
  );
};

export default Inventory;
