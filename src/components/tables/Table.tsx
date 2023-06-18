import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Column } from "react-table";
import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";

type TableProps = {
  data: any;
  columns: Array<Column<any>>;
  filter?: string;
  setFilter?: React.Dispatch<React.SetStateAction<string>>;
};

const Table: React.FC<TableProps> = ({ data, columns, filter }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    setPageSize,
    gotoPage,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 15, pageIndex: currentPage },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    setGlobalFilter(filter);
  }, [filter]);

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-left text-sm text-gray-500 dark:text-gray-400"
        {...getTableProps()}
      >
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, i) => (
                <th
                  className="px-6 py-3"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={i}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                {...row.getRowProps()}
                key={i}
              >
                {row.cells.map((cell, i) => {
                  return (
                    <td className="px-4 py-3" {...cell.getCellProps()} key={i}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <nav
        className="flex items-center justify-between pt-4"
        aria-label="Table navigation"
      >
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {1 + pageIndex * pageSize}-{page.length + pageIndex * pageSize}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.length}
          </span>
        </span>
        <ul className="inline-flex items-center -space-x-px">
          <li
            className="cursor-pointer rounded-l-md border-2 p-2 hover:bg-gray-200"
            onClick={previousPage}
          >
            <ChevronLeft />
          </li>
          {[
            pageIndex - 2,
            pageIndex - 1,
            pageIndex,
            pageIndex + 1,
            pageIndex + 2,
            pageIndex + 3,
            pageIndex + 4,
            pageIndex + 5,
          ]
            .filter((pageNo) => pageNo > 0 && pageNo <= pageOptions.length)
            .map((page, i) => {
              if (i > 4) return null;
              return (
                <li
                  key={page}
                  onClick={() => {
                    gotoPage(page - 1);
                  }}
                  className={`cursor-pointer border-2 py-2 px-4 hover:bg-gray-200 ${
                    pageIndex + 1 === page ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  {page}
                </li>
              );
            })}
          <li
            className="cursor-pointer rounded-r-md border-2 p-2 hover:bg-gray-200"
            onClick={nextPage}
          >
            <ChevronRight />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Table;
