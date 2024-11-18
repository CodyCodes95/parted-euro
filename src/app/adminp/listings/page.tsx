"use client";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { trpc } from "@/utils/trpc";

const Listings = () => {
  const listings = trpc.listings.getAllAdmin.useQuery();
  if (!listings.data) return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Listings</h2>
        </div>
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <DataTable data={listings.data} columns={columns} />
      </div>
    </div>
  );
};

export default Listings;
