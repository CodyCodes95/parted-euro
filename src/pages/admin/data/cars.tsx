import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { trpc } from "../../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../../components/tables/AdminTable";
import AddCar from "../../../components/cars/AddCar";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";
import type { Car } from "@prisma/client";
import Spacer from "../../../components/Spacer";
import { useSession } from "next-auth/react";
import FilterInput from "../../../components/tables/FilterInput";
import { Button } from "../../../components/ui/button";
import BreadCrumbs from "../../../components/BreadCrumbs";

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

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const cars = trpc.cars.getAll.useQuery();
  const deleteCar = trpc.cars.deleteCar.useMutation();

  const deleteCarFunction = async () => {
    if (selectedCar) {
      await deleteCar.mutateAsync({ id: selectedCar.id });
      setShowDeleteModal(false);
    }
  };

  const columns = useMemo<Array<Column<any>>>(
    () => [
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
        accessor: (d: Car) => (
          <Button
            onClick={() => {
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
        accessor: (d: Car) => (
          <Button
            onClick={() => {
              setSelectedCar(d);
              setShowDeleteModal(true);
            }}
          >
            Delete Car
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Parts</title>
      </Head>
      <ConfirmDelete
        deleteFunction={deleteCarFunction}
        setShowModal={setShowDeleteModal}
        showModal={showDeleteModal}
      />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
        <Spacer amount="2" />
        {showModal ? (
          <AddCar
            car={selectedCar}
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            refetch={cars.refetch}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <Button
              onClick={() => {
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
