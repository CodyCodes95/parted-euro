import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../../utils/trpc";
import AddListing from "../../../components/listings/AddListing";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminTable from "../../../components/tables/AdminTable";
import type { Column } from "react-table";
import EbayModal from "../../../components/listings/EbayModal";
import Spacer from "../../../components/Spacer";
import { useSession } from "next-auth/react";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";
import { Button } from "../../../components/ui/button";
import FilterInput from "../../../components/tables/FilterInput";

const Listings: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const router = useRouter();

  const { code } = router.query;

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>(null);
  const [showEbayModal, setShowEbayModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const listings = trpc.listings.getAllAdmin.useQuery();
  const ebayLogin = trpc.ebay.authenticate.useMutation();
  const updateRefreshToken = trpc.ebay.updateRefreshToken.useMutation();
  const deleteListing = trpc.listings.deleteListing.useMutation();
  const markAsNotListedEbay = trpc.listings.markAsNotListedEbay.useMutation();

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Title",
        accessor: (d) => d.title,
        Cell: ({ row }) => (
          <Link href={`/listings/listing?id=${row.original.id}`}>
            <p className="text-blue-500 hover:text-blue-600">
              {row.original.title}
            </p>
          </Link>
        ),
      },
      {
        Header: "Part Numbers",
        accessor: (d) => d.parts.map((p: any) => p.partDetailsId).join(", "),
      },
      {
        Header: "Quantity",
        accessor: "quantity",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Listed On Ebay",
        accessor: (d) =>
          d.listedOnEbay ? (
            <Button
              onClick={() => {
                markAsNotListedEbay.mutate({ id: d.id });
                setShowEbayModal(true);
                setSelected(d);
              }}
            >
              Relist
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSelected(d);
                setShowEbayModal(true);
              }}
            >
              List
            </Button>
          ),
      },
      {
        Header: "Listed On",
        accessor: (d) => d.createdAt.toLocaleString(),
      },
      {
        Header: "Edit",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelected(d);
              setShowModal(true);
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
              setSelected(d);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    []
  );

  const onDeleteListing = async () => {
    const res = deleteListing.mutateAsync({ id: selected.id });
    listings.refetch();
    success("Listing deleted");
  };

  const authenticateEbay = async () => {
    const result = await ebayLogin.mutateAsync();
    if (result) {
      router.push(result.url);
    }
  };

  useEffect(() => {
    if (code) {
      const updateTokenRes = updateRefreshToken.mutateAsync({
        code: code as string,
      });
      console.log(updateTokenRes);
      router.replace("/admin/listings", undefined, { shallow: true });
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Listings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfirmDelete
        deleteFunction={onDeleteListing}
        setShowModal={setShowDeleteModal}
        showModal={showDeleteModal}
      />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-2 mb-2 w-fit rounded-lg border border-gray-800 px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-800"
          >
            {"<"}
          </Link>
          <Spacer amount="2" />
          <p className="text-xl">admin/listings</p>
        </div>
        <Spacer amount="2" />
        {showModal ? (
          <AddListing
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
            listing={selected}
            refetch={listings.refetch}
          />
        ) : null}
        {showEbayModal ? (
          <EbayModal
            success={success}
            error={error}
            showModal={showEbayModal}
            setShowModal={setShowEbayModal}
            listing={selected}
            refetch={listings.refetch}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                setSelected(null);
                setShowModal(true);
              }}
            >
              Add Listing
            </button>
          </div>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for listings..."
          />
        </div>
        <AdminTable
          filter={filter}
          setFilter={setFilter}
          columns={columns}
          data={listings}
        />
        <div>
          <Button onClick={authenticateEbay}>Renew Ebay</Button>
          <Button>
            <Link href="/admin/ebay">Ebay Dashboard</Link>
          </Button>
        </div>
      </main>
    </>
  );
};

export default Listings;
