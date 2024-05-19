import { useSession } from "next-auth/react";
import type { OrderWithItems, QueryOrderGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import AdminTable from "../../components/tables/AdminTable";
import { useMemo, useState } from "react";
import Head from "next/head";
import Spacer from "../../components/Spacer";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
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

const Orders = () => {
  const [filter, setFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<
    OrderWithItems | undefined
  >();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const orders = trpc.order.getAllAdmin.useQuery();

  const regenerateInvoice = trpc.order.regenerateInvoice.useMutation();
  const sendOrderReadyForPickup =
    trpc.order.sendOrderReadyForPickup.useMutation();

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
        accessor: (d) => new Date(d.createdAt).toLocaleDateString(),
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
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Type",
        accessor: (d) => (d.shipping ? "Shipped" : "Pickup"),
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <File />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Order</DialogTitle>
                {/* <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription> */}
              </DialogHeader>
              {d.orderItems?.map((item) => <div key={item.id}></div>)}
              {/* <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue="Pedro Duarte"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    defaultValue="@peduarte"
                    className="col-span-3"
                  />
                </div>
              </div> */}
            </DialogContent>
          </Dialog>
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
              <DropdownMenuItem onClick={() => setSelectedOrder(d)}>
                <Package className="mr-2 h-4 w-4" />
                <span>Add tracking number</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await sendOrderReadyForPickup.mutateAsync({ order: d });
                  toast.success("Email sent");
                }}
              >
                <File className="mr-2 h-4 w-4" />
                <span>Ready for pickup</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await regenerateInvoice.mutateAsync({ id: d.id });
                  toast.success("Email sent");
                }}
                disabled={!d.FailedOrder.length}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Regenerate invoice</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>Listings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
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
      <TrackingNumberModal
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(undefined);
        }}
      />
    </>
  );
};

export default Orders;

type TrackingNumberModalProps = {
  order: OrderWithItems | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TrackingNumberModal = ({
  order,
  onOpenChange,
  open,
}: TrackingNumberModalProps) => {
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order?.trackingNumber ?? "",
  );
  const [carrier, setCarrier] = useState<string>(order?.shippingMethod ?? "");

  const sendOrderShippedEmail = trpc.order.sendOrderShippedEmail.useMutation();
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
            <Button onClick={onSave}>Send</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
