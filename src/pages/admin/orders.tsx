import { useSession } from "next-auth/react";
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

const Orders = () => {
  const [filter, setFilter] = useState<string>("");
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const orders = trpc.order.getAllAdmin.useQuery();

  const columns = useMemo<Array<Column<Order>>>(
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
    </>
  );
};

export default Orders;
