import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
import BreadCrumbs from "../../../components/BreadCrumbs";

const Listings: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const router = useRouter();

  const { code } = router.query;

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const listings = trpc.listings.getAllAdmin.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
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
            variant="destructive"
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
        <BreadCrumbs />
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
          <Button
            onClick={() => {
              setSelected(null);
              setShowModal(true);
            }}
          >
            Add Listing
          </Button>
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
