import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import Spacer from "../../../components/Spacer";
import { useSession } from "next-auth/react";
import type { PartTypeParentCategory, PartTypes } from "@prisma/client";
import AddCategory from "../../../components/categories/AddCategory";
import { error, success } from "../../../utils/toast";

const Categories: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  //   const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    | PartTypeParentCategory
    | (PartTypes & { parentCategory: PartTypeParentCategory })
    | null
  >(null);
  const [filter, setFilter] = useState<string>("");

  //   const parentCategories = trpc.categories.getAllCategories.useQuery();
  const subCategories = trpc.categories.getAllSubCategories.useQuery();

  //   const parentData = useMemo(
  //     () => parentCategories.data,
  //     [parentCategories.data]
  //   );

  const subData = useMemo(() => subCategories.data, [subCategories.data]);

  //   const parentCols = useMemo<Array<Column<PartTypeParentCategory>>>(
  //     () => [
  //       {
  //         Header: "Category",
  //         accessor: "name",
  //       },
  //       {
  //         Header: "Edit",
  //         accessor: (d) => (
  //           <button
  //             className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
  //             onClick={() => {
  //               setSelectedCategory(d);
  //               setShowEditModal(true);
  //             }}
  //           >
  //             Edit
  //           </button>
  //         ),
  //       },
  //     ],
  //     []
  //   );

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
      //   {
      //     Header: "Edit",
      //     accessor: (d) => (
      //       <button
      //         className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      //         onClick={() => {
      //           setSelectedCategory(d);
      //           setShowEditModal(true);
      //         }}
      //       >
      //         Edit
      //       </button>
      //     ),
      //   },
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
        />
      ) : null}
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <div>
          <button
            className="
                mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setShowModal(true)}
          >
            Add Category
          </button>
        </div>
        {/* {parentCategories.data ? (
                  <AdminTable columns={parentCols} data={parentCategories.data} />
              ) : null} */}
        {subCategories.data ? (
          <AdminTable columns={subCols} data={subCategories.data} />
        ) : null}
      </main>
    </>
  );
};

export default Categories;
