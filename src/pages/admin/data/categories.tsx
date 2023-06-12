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
import BreadCrumbs from "../../../components/BreadCrumbs";

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
        <BreadCrumbs />
        <div className="py-4">
          <Button
            onClick={() => {
              setSelectedCategory(undefined);
              setShowModal(true);
            }}
          >
            Add Category
          </Button>
        </div>
        <AdminTable columns={subCols} data={subCategories} />
      </main>
    </>
  );
};

export default Categories;
