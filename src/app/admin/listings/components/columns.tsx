"use client";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

import { labels, priorities, statuses } from "../data/data";
import type { QueryListingsGetAllAdmin } from "@/utils/trpc";

const calculateQty = (listing: QueryListingsGetAllAdmin) => {
  // Group parts by partDetailsId and sum their quantities
  const groupedParts = listing.parts.reduce(
    (acc, part) => {
      if (!acc[part.partDetailsId]) {
        acc[part.partDetailsId] = 0;
      }
      acc[part.partDetailsId]! += part.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find the maximum sum of quantities for any part number
  const maxQuantity = Math.max(...Object.values(groupedParts));
  return maxQuantity;
};

export const columns: ColumnDef<QueryListingsGetAllAdmin>[] = [
  // hidden columns for filtering
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.title);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "parts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Numbers" />
    ),
    cell: ({ cell }) => {
      const partNumbers = cell
        .getValue()
        ?.map((part) => part.partDetailsId)
        .join(", ");
      return (
        <div className="flex w-[100px] items-center">
          <span>{partNumbers}</span>
        </div>
      );
    },
  },
  {
    id: "quantity",
    accessorKey: "parts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => {
      const qty = calculateQty(row.original);
      return (
        <div className="flex w-[100px] items-center">
          <span>{qty}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     const status = statuses.find(
  //       (status) => status.value === row.getValue("status"),
  //     );

  //     if (!status) {
  //       return null;
  //     }

  //     return (
  //       <div className="flex w-[100px] items-center">
  //         {status.icon && (
  //           <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{status.label}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  // {
  //   accessorKey: "priority",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Priority" />
  //   ),
  //   cell: ({ row }) => {
  //     const priority = priorities.find(
  //       (priority) => priority.value === row.getValue("priority"),
  //     );

  //     if (!priority) {
  //       return null;
  //     }

  //     return (
  //       <div className="flex items-center">
  //         {priority.icon && (
  //           <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{priority.label}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
