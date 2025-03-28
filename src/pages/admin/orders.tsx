import { useSession } from "next-auth/react";
import type { OrderWithItems, QueryOrderGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import AdminTable from "../../components/tables/AdminTable";
import { useMemo, useState } from "react";
import Head from "next/head";
import Spacer from "../../components/Spacer";
import BreadCrumbs, { adminPages } from "../../components/admin/BreadCrumbs";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import type { Column } from "react-table";
import type { Order } from "@prisma/client";
import {
  DialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  File,
  Mail,
  Option,
  Package,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import Table from "../../components/tables/Table";
import { useQueryState } from "nuqs";

type PartFromOrder = {
  part: string;
  donorVin: string | null;
  quantity: number;
  inventoryLocation: string | undefined;
  partNo: string;
  price: number;
  total: number;
};

type OrderPart = {
  partDetails: {
    name: string;
    partNo: string;
  };
  donorVin: string | null;
  inventoryLocation: {
    name: string;
  } | null;
};

const Orders = () => {
  const [filter, setFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<
    OrderWithItems | undefined
  >();
  const [selectedOrderId, setSelectedOrderId] = useQueryState("orderId");
  useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const orders = trpc.order.getAllAdmin.useQuery();

  const regenerateInvoice = trpc.order.regenerateInvoice.useMutation();
  const sendOrderReadyForPickup =
    trpc.order.sendOrderReadyForPickup.useMutation({
      onSuccess: () => {
        void orders.refetch();
      },
    });
  const updateOrderStatus = trpc.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      void orders.refetch();
      toast.success("Order status updated");
    },
  });

  const getPartsFromOrdeQuery = (
    order: QueryOrderGetAllAdmin,
  ): PartFromOrder[] => {
    const parts = order.orderItems.map((item) => {
      return item.listing.parts
        .reduce((acc: OrderPart[], cur: OrderPart) => {
          if (
            !acc.some(
              (part) => part.partDetails.partNo === cur.partDetails.partNo,
            )
          ) {
            acc.push(cur);
          }
          return acc;
        }, [])
        .map((part: OrderPart): PartFromOrder => {
          return {
            part: part.partDetails.name,
            donorVin: part.donorVin,
            quantity: item.quantity,
            inventoryLocation: part.inventoryLocation?.name,
            partNo: part.partDetails.partNo,
            price: item.listing.price,
            total: item.listing.price * item.quantity,
          };
        });
    });
    return parts.flat();
  };

  const orderItemColumns = useMemo<Array<Column<PartFromOrder>>>(
    () => [
      {
        Header: "Part",
        accessor: "part",
      },
      {
        Header: "Donor Vin",
        accessor: "donorVin",
      },
      {
        Header: "Part No",
        accessor: "partNo",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
      },
      {
        Header: "Inventory Location",
        accessor: "inventoryLocation",
      },
      {
        Header: "Price",
        accessor: "price",
        // eslint-disable-next-line
        Cell: (data: any) =>
          // eslint-disable-next-line
          data.value.toLocaleString("en-AU", {
            style: "currency",
            currency: "AUD",
          }),
      },
      {
        Header: "Total",
        accessor: "total",
        // eslint-disable-next-line
        Cell: (data: any) =>
          // eslint-disable-next-line
          data.value.toLocaleString("en-AU", {
            style: "currency",
            currency: "AUD",
          }),
      },
    ],
    [],
  );

  const columns = useMemo<Array<Column<QueryOrderGetAllAdmin>>>(
    () => [
      {
        Header: "ID",
        accessor: "xeroInvoiceId",
        Cell: ({ row, value }) => {
          return (
            <Link
              className="text-blue-500"
              target="_blank"
              href={`https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${row.original.xeroInvoiceRef}`}
            >
              {value}
            </Link>
          );
        },
      },
      {
        Header: "Order date",
        accessor: (d) => new Date(d.createdAt).toLocaleDateString("en-AU"),
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Phone",
        accessor: "phoneNumber",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Shipping method",
        accessor: "shippingMethod",
      },
      {
        Header: "Tracking number",
        accessor: "trackingNumber",
      },
      {
        Header: "Shipping Address",
        accessor: "shippingAddress",
      },
      {
        Header: "Total",
        accessor: (d) =>
          (Number(d.subtotal / 100) + Number(d.shipping)).toLocaleString(
            "en-AU",
            {
              style: "currency",
              currency: "AUD",
            },
          ),
      },
      {
        Header: "View Order",
        accessor: (d) => (
          <Button
            variant="outline"
            onMouseDown={() => setSelectedOrderId(d.id)}
          >
            <File />
          </Button>
        ),
      },
      {
        Header: "Options",
        accessor: (d) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onMouseDown={() => setSelectedOrder(d)}>
                <Package className="mr-2 h-4 w-4" />
                <span>Add tracking number</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onMouseDown={async () => {
                  await sendOrderReadyForPickup.mutateAsync({ order: d });
                  toast.success("Email sent");
                }}
              >
                <File className="mr-2 h-4 w-4" />
                <span>Ready for pickup</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onMouseDown={async () => {
                  await regenerateInvoice.mutateAsync({ id: d.id });
                  toast.success("Email sent");
                }}
                disabled={!d.FailedOrder.length}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Regenerate invoice</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Update Status</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onMouseDown={async () => {
                        await updateOrderStatus.mutateAsync({
                          id: d.id,
                          status: "Completed",
                        });
                      }}
                    >
                      <span>Completed</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onMouseDown={async () => {
                        await updateOrderStatus.mutateAsync({
                          id: d.id,
                          status: "Cancelled",
                        });
                      }}
                    >
                      <span>Cancelled</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const selectedOrderDetails = orders.data?.find(
    (order) => order.id === selectedOrderId,
  );

  return (
    <>
      <Head>
        <title>Admin - Orders</title>
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            orders: adminPages,
          }}
        />
        <Spacer amount="2" />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for orders..."
          />
        </div>
        <AdminTable
          filter={filter}
          setFilter={setFilter}
          columns={columns}
          data={orders}
        />
      </main>
      <ViewOrderModal
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) void setSelectedOrderId(null);
        }}
        order={selectedOrderDetails}
        columns={orderItemColumns}
        getPartsFromOrder={getPartsFromOrdeQuery}
      />
      <TrackingNumberModal
        onSuccess={() => void orders.refetch()}
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(undefined);
        }}
      />
    </>
  );
};

type ViewOrderModalProps = {
  order: QueryOrderGetAllAdmin | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Array<Column<PartFromOrder>>;
  getPartsFromOrder: (order: QueryOrderGetAllAdmin) => PartFromOrder[];
};

const ViewOrderModal = ({
  order,
  open,
  onOpenChange,
  columns,
  getPartsFromOrder,
}: ViewOrderModalProps) => {
  if (!order) return null;

  const parts = getPartsFromOrder(order);
  const subtotal = parts.reduce((sum, part) => sum + part.total, 0);
  const shipping = order.shipping ?? 0;
  const total = subtotal + shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>Order</DialogTitle>
        </DialogHeader>
        <Table columns={columns} data={parts} />
        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>
              {subtotal.toLocaleString("en-AU", {
                style: "currency",
                currency: "AUD",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Shipping:</span>
            <span>
              {shipping.toLocaleString("en-AU", {
                style: "currency",
                currency: "AUD",
              })}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-lg font-bold">
              {total.toLocaleString("en-AU", {
                style: "currency",
                currency: "AUD",
              })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Orders;

type TrackingNumberModalProps = {
  order: OrderWithItems | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const TrackingNumberModal = ({
  onSuccess,
  order,
  onOpenChange,
  open,
}: TrackingNumberModalProps) => {
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order?.trackingNumber ?? "",
  );
  const [carrier, setCarrier] = useState<string>(order?.shippingMethod ?? "");

  const sendOrderShippedEmail = trpc.order.sendOrderShippedEmail.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });
  const updateOrder = trpc.order.updateOrder.useMutation();

  const onSave = async () => {
    if (!order) return;
    await updateOrder.mutateAsync({
      id: order.id,
      trackingNumber: trackingNumber,
      shippingMethod: carrier,
    });
    await sendOrderShippedEmail.mutateAsync({ order });
    toast.success("Email sent");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send tracking</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div>
            <Label>Tracking number</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <div>
            <Label>Carrier</Label>
            <Input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full justify-end">
          <DialogClose>
            <Button onMouseDown={onSave}>Send</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
