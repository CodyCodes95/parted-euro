import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import type { QueryListingsGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import AddListing from "../../components/listings/AddListing";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminTable from "../../components/tables/AdminTable";
import type { Column } from "react-table";
import EbayModal from "../../components/listings/EbayModal";
import Spacer from "../../components/Spacer";
import { useSession } from "next-auth/react";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import { Button } from "../../components/ui/button";
import FilterInput from "../../components/tables/FilterInput";
import BreadCrumbs, { adminPages } from "../../components/admin/BreadCrumbs";
import { toast } from "sonner";
import AddToOrder from "../../components/listings/AddToOrder";
import FinialiseOrderToast from "../../components/admin/FinialiseOrderToast";
import { type CheckoutItem } from "../api/checkout";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FinialiseOrder from "@/components/modals/FinialiseOrder";

export type OrderItem = {
  inventoryId: string;
  quantity: number;
  price: number;
};

const calculateQty = (listing: QueryListingsGetAllAdmin) => {
  // Group parts by partDetailsId and sum their quantities
  const groupedParts = listing.parts.reduce(
    (acc, part) => {
      if (!acc[part.partDetailsId]) {
        acc[part.partDetailsId] = 0;
      }
      acc[part.partDetailsId] += part.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find the maximum sum of quantities for any part number
  const maxQuantity = Math.max(...Object.values(groupedParts));
  return maxQuantity;
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

  const [showModal, setShowModal] = useQueryState(
    "showModal",
    parseAsBoolean.withDefault(false),
  );
  const [selected, setSelected] = useState<QueryListingsGetAllAdmin>();
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkAsSold, setShowMarkAsSold] = useState(false);
  const [order, setOrder] = useState<CheckoutItem[] | undefined>();
  const [showFinialiseOrder, setShowFinialiseOrder] = useState(false);

  const listings = trpc.listings.getAllAdmin.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const ebayLogin = trpc.ebay.authenticate.useMutation();
  const updateRefreshToken = trpc.ebay.setTokenSet.useMutation();
  const deleteListing = trpc.listings.deleteListing.useMutation();
  const markAsNotListedEbay = trpc.listings.markAsNotListedEbay.useMutation();

  useEffect(() => {
    if (order?.length) {
      toast(
        <FinialiseOrderToast
          setShowFinialiseOrder={setShowFinialiseOrder}
          order={order}
        />,
        {
          duration: 5000000,
          id: "order",
        },
      );
    }
  }, [order]);

  const columns = useMemo<Array<Column<QueryListingsGetAllAdmin>>>(
    () => [
      {
        Header: "ID",
        accessor: (d) => d.id,
      },
      {
        Header: "Title",
        accessor: (d) => d.title,
        Cell: ({ row }: any) => (
          <Link href={`/listings/${row.original.id}`}>
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
        accessor: (d) => calculateQty(d),
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
              onMouseDown={() => {
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
              onMouseDown={() => {
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
            onMouseDown={() => {
              setSelected(d);
              void setShowModal(true);
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
            onMouseDown={() => {
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
            onMouseDown={() => {
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
    [order],
  );

  const onDeleteListing = async () => {
    const res = deleteListing.mutateAsync({ id: selected!.id });
    void listings.refetch();
    toast.success("Listing deleted");
    setSelected(undefined);
    setShowDeleteModal(false);
  };

  const authenticateEbay = async () => {
    const url = await ebayLogin.mutateAsync();
    if (url) {
      void router.push(url);
    }
  };

  useEffect(() => {
    if (code) {
      const updateTokenRes = updateRefreshToken.mutateAsync({
        code: code as string,
      });
      console.log(updateTokenRes);
      void router.replace("/admin/listings", undefined, { shallow: true });
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Admin - Listings</title>
      </Head>
      <ConfirmDelete
        deleteFunction={onDeleteListing}
        setShowModal={setShowDeleteModal}
        showModal={showDeleteModal}
      />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            listings: adminPages,
          }}
        />
        <Spacer amount="2" />
        {showModal && (
          <AddListing
            showModal={showModal}
            setShowModal={setShowModal}
            listing={selected}
            refetch={listings.refetch}
          />
        )}
        {showEbayModal && selected && (
          <EbayModal
            showModal={showEbayModal}
            setShowModal={setShowEbayModal}
            listing={selected}
            refetch={listings.refetch}
          />
        )}
        {showMarkAsSold && (
          <AddToOrder
            setOrder={setOrder}
            order={order}
            isOpen={showMarkAsSold}
            onClose={() => {
              void listings.refetch();
              setShowMarkAsSold(false);
            }}
            title="Mark as sold"
            listing={selected!}
          />
        )}
        <Dialog open={showFinialiseOrder} onOpenChange={setShowFinialiseOrder}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finialise Order</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <FinialiseOrder order={order!} setOrder={setOrder} />
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <Button
            onMouseDown={() => {
              setSelected(undefined);
              void setShowModal(true);
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
          <Button onMouseDown={authenticateEbay}>Renew Ebay</Button>
          <Button>
            <Link href="/admin/ebay">Ebay Dashboard</Link>
          </Button>
        </div>
      </main>
    </>
  );
};

export default Listings;
