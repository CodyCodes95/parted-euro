import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import type { GetAllSubCategoriesQuery} from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import { useSession } from "next-auth/react";
import type { PartTypes } from "@prisma/client";
import AddCategory from "../../components/categories/AddCategory";
import { Button } from "../../components/ui/button";
import BreadCrumbs from "../../components/admin/BreadCrumbs";

const Categories: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    PartTypes | undefined
  >();

  const subCategories = trpc.categories.getAllSubCategories.useQuery();

  const subCols = useMemo<Array<Column<GetAllSubCategoriesQuery>>>(
    () => [
      {
        Header: "Category",
        accessor: "name",
      },
      {
        Header: "Parent Category",
        accessor: (d) => d.parent?.name,
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
        <title>Admin - Categories</title>
      </Head>
      {showModal && (
        <AddCategory
          refetch={subCategories.refetch}
          setShowModal={setShowModal}
          showModal={showModal}
          selection={selectedCategory}
        />
      )}
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            categories: [
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
