import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../utils/trpc";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import { useSession } from "next-auth/react";
import FilterInput from "../../components/tables/FilterInput";
import BreadCrumbs, { adminPages } from "../../components/admin/BreadCrumbs";
import { Button } from "../../components/ui/button";
import type { User } from "@prisma/client";

const Users: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const [filter, setFilter] = useState<string>("");
  const users = trpc.users.getAll.useQuery();
  const toggleAdmin = trpc.users.toggleAdmin.useMutation({
    onSuccess: () => {
      void users.refetch();
      toast.success("User admin status updated successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const columns = useMemo<Array<Column<User>>>(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Admin Status",
        accessor: (d) => (
          <Button
            variant={d.isAdmin ? "destructive" : "default"}
            onClick={() => {
              toggleAdmin.mutate({
                userId: d.id,
                isAdmin: !d.isAdmin,
              });
            }}
          >
            {d.isAdmin ? "Remove Admin" : "Make Admin"}
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>Admin - Users</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs
          selectOptions={{
            users: adminPages,
          }}
        />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for users..."
          />
        </div>
        <AdminTable
          filter={filter}
          setFilter={setFilter}
          columns={columns}
          data={users}
        />
      </main>
    </>
  );
};

export default Users;
