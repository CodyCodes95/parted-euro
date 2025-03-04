import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import AddCar from "../../components/cars/AddCar";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import type { Car } from "@prisma/client";
import Spacer from "../../components/Spacer";
import { useSession } from "next-auth/react";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import BreadCrumbs, { adminPages } from "../../components/admin/BreadCrumbs";

const Cars: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [filter, setFilter] = useState<string>("");

  const cars = trpc.cars.getAll.useQuery();
  const deleteCar = trpc.cars.deleteCar.useMutation();

  const deleteCarFunction = async () => {
    if (selectedCar) {
      await deleteCar.mutateAsync({ id: selectedCar.id });
      void cars.refetch();
      setShowDeleteModal(false);
    }
  };

  const columns = useMemo<Array<Column<Car>>>(
    () => [
      {
        Header: "Make",
        accessor: "make",
      },
      {
        Header: "Series",
        accessor: "series",
      },
      {
        Header: "Generation",
        accessor: "generation",
      },
      {
        Header: "Model",
        accessor: "model",
      },
      {
        Header: "Body",
        accessor: "body",
      },
      {
        Header: "Edit Car",
        accessor: (d) => (
          <Button
            onMouseDown={() => {
              setSelectedCar(d);
              setShowModal(true);
            }}
          >
            Edit Car
          </Button>
        ),
      },
      {
        Header: "Delete Car",
        accessor: (d) => (
          <Button
            onMouseDown={() => {
              setSelectedCar(d);
              setShowDeleteModal(true);
            }}
            variant="destructive"
          >
            Delete Car
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>Admin - Cars</title>
      </Head>
      <ConfirmDelete
        deleteFunction={deleteCarFunction}
        setShowModal={setShowDeleteModal}
        showModal={showDeleteModal}
      />
      <main className="m-20 flex min-h-screen flex-col gap-2 bg-white">
        <BreadCrumbs
          selectOptions={{
            cars: adminPages,
          }}
        />
        {showModal && (
          <AddCar
            car={selectedCar}
            showModal={showModal}
            setShowModal={setShowModal}
            refetch={cars.refetch}
          />
        )}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <Button
              onMouseDown={() => {
                setSelectedCar(null);
                setShowModal(true);
              }}
            >
              Add Car
            </Button>
          </div>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for cars..."
          />
        </div>
        <AdminTable
          columns={columns}
          data={cars}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
    </>
  );
};

export default Cars;
