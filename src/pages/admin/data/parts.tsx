import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { trpc } from "../../../utils/trpc";
import AddPartDetails from "../../../components/parts/AddPartDetails";
import type { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";
import EditPartDetails from "../../../components/parts/EditPartDetails";
import { useSession } from "next-auth/react";
import type { PartDetailWithRelations } from "../../../types/prisma-query-types";
import FilterInput from "../../../components/tables/FilterInput";
import BreadCrumbs from "../../../components/BreadCrumbs";
import { Button } from "../../../components/ui/button";

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
  const [selectedPart, setSelectedPart] =
    useState<PartDetailWithRelations | null>(null);
  const [filter, setFilter] = useState<string>("");

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.partDetails.getAll.useQuery();
  const deletePart = trpc.partDetails.deletePartDetail.useMutation({
    onError: (err: any) => {
      error(err.message);
    },
  });

  const tableData = useMemo(() => parts.data, [parts.data]);

  const columns = useMemo<Array<Column<PartDetailWithRelations>>>(
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
        accessor: "alternatePartNumbers",
      },
      {
        Header: "Weight",
        accessor: "weight",
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
        Header: "Length",
        accessor: "length",
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
    []
  );

  const deletePartDetailFunc = async () => {
    if (selectedPart) {
      await deletePart.mutateAsync({ partNo: selectedPart.partNo });
      parts.refetch();
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
        {showConfirmDelete ? (
          <ConfirmDelete
            showModal={showConfirmDelete}
            setShowModal={setShowConfirmDelete}
            deleteFunction={deletePartDetailFunc}
          />
        ) : null}
        {showModal ? (
          <AddPartDetails
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            refetch={parts.refetch}
          />
        ) : null}
        {showEditModal && selectedPart ? (
          <EditPartDetails
            success={success}
            error={error}
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
