import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import { useSession } from "next-auth/react";
import type { PartTypeParentCategory, PartTypes } from "@prisma/client";
import AddCategory from "../../../components/categories/AddCategory";
import { error, success } from "../../../utils/toast";
import { Button } from "../../../components/ui/button";

const Categories: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    | PartTypeParentCategory
    | (PartTypes & { parentCategory: PartTypeParentCategory })
    | undefined
  >();
  const [filter, setFilter] = useState<string>("");

  const subCategories = trpc.categories.getAllSubCategories.useQuery();

  const subData = useMemo(() => subCategories.data, [subCategories.data]);

  const subCols = useMemo<
    Array<Column<PartTypes & { parentCategory: PartTypeParentCategory }>>
  >(
    () => [
      {
        Header: "Category",
        accessor: "name",
      },
      {
        Header: "Parent Category",
        accessor: (d) => d.parentCategory.name,
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelectedCategory(d);
              setShowModal(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Categories</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      {showModal ? (
        <AddCategory
          refetch={subCategories.refetch}
          success={success}
          error={error}
          setShowModal={setShowModal}
          showModal={showModal}
          selection={selectedCategory}
        />
      ) : null}
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <div>
          <button
            className="
                mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              setSelectedCategory(undefined);
              setShowModal(true);
            }}
          >
            Add Category
          </button>
        </div>
        <AdminTable columns={subCols} data={subCategories} />
      </main>
    </>
  );
};

export default Categories;
