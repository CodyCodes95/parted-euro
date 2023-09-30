import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
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
import type {
  Car,
  Image,
  Listing,
  Order,
  Part,
  PartDetail,
} from "@prisma/client";
import { toast } from "sonner";
import AddToOrder from "../../../components/listings/AddToOrder";
import FinialiseOrder from "../../../components/modals/FinialiseOrder";

type AdminListingQuery = Listing & {
  parts: (Part & {
    partDetails: PartDetail & {
      cars: Car[];
    };
  })[];
  images: Image[];
};

export type OrderItem = {
  inventoryId: string;
  quantity: number;
  price: number;
};

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
  const [showMarkAsSold, setShowMarkAsSold] = useState(false);
  const [order, setOrder] = useState<OrderItem[] | undefined>();
  const [showFinialiseOrder, setShowFinialiseOrder] = useState(false);

  const listings = trpc.listings.getAllAdmin.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const ebayLogin = trpc.ebay.authenticate.useMutation();
  const updateRefreshToken = trpc.ebay.updateRefreshToken.useMutation();
  const deleteListing = trpc.listings.deleteListing.useMutation();
  const markAsNotListedEbay = trpc.listings.markAsNotListedEbay.useMutation();

  useEffect(() => {
    if (order?.length) {
      toast(`${order.length} items in current order`, {
        action: {
          label: "Finialise",
          onClick: () => setShowFinialiseOrder(true),
        },
        duration: 50000,
        id: "order"
      });
    }
  }, [order]);

  const columns = useMemo<Array<Column<AdminListingQuery>>>(
    () => [
      {
        Header: "Title",
        accessor: (d) => d.title,
        Cell: ({ row }: any) => (
          <Link href={`/listings/listing?id=${row.original.id}`}>
            <p className="text-blue-500 hover:text-blue-600">
              {row.original.title}
            </p>
          </Link>
        ),
      },
      {
        Header: "Part Numbers",
        accessor: (d) => d.parts.map((p) => p.partDetailsId).join(", "),
      },
      {
        Header: "Price",
        accessor: (d) => `$${d.price}`,
      },
      {
        Header: "Quantity",
        accessor: (d) =>
          d.parts.length > 1
            ? 1
            : d.parts.reduce((acc, cur) => {
                acc += cur.quantity;
                return acc;
              }, 0),
      },
      {
        Header: "Listed On",
        accessor: (d) => d.createdAt.toLocaleString(),
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
              variant="outline"
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
        Header: order ? "Add to order" : "Create order",
        accessor: (d) => (
          <Button
            onClick={() => {
              setSelected(d);
              setShowMarkAsSold(true);
            }}
            variant="outline"
          >
            {order ? "Add" : "Create order"}
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
    toast.success("Listing deleted");
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
            showModal={showModal}
            setShowModal={setShowModal}
            listing={selected}
            refetch={listings.refetch}
          />
        ) : null}
        {showEbayModal ? (
          <EbayModal
            showModal={showEbayModal}
            setShowModal={setShowEbayModal}
            listing={selected}
            refetch={listings.refetch}
          />
        ) : null}
        {showMarkAsSold && (
          <AddToOrder
            setOrder={setOrder}
            isOpen={showMarkAsSold}
            onClose={() => {
              listings.refetch();
              setShowMarkAsSold(false);
            }}
            title="Mark as sold"
            listing={selected}
          />
        )}
        {showFinialiseOrder && order?.length && (
          <FinialiseOrder
            order={order}
            isOpen={showFinialiseOrder}
            onClose={() => setShowFinialiseOrder(false)}
          />
        )}
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
