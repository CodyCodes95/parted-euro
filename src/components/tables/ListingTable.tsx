import { Listing} from "@prisma/client";
import { useMemo, useState } from "react";
import { Column, usePagination, useSortBy, useTable } from "react-table";
import { trpc } from "../../utils/trpc";
import EbayModal from "../listings/EbayModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { success, error } from "../../utils/toast";

type ListingTable = {
  data: any;
};

const ListingTable: React.FC<ListingTable> = ({ data }) => {
  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Title",
        accessor: "title",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Listed On Ebay",
        accessor: (d) =>
          d.ebayListing ? (
            <button className="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
              View Ebay Listing
            </button>
          ) : (
            <button
              onClick={() => {
                setShowModal(true);
                setCurrentListing(d);
              }}
              className="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            >
              List on eBay
            </button>
          ),
      },
      {
        Header: "Listed On",
        accessor: (d) => d.createdAt.toLocaleString(),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    setPageSize,
    gotoPage,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    usePagination
  );

  const [showModal, setShowModal] = useState(false);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);

  return (
    <div>
      {showModal && currentListing ? (
        <EbayModal
          success={success}
          error={error}
          showModal={showModal}
          setShowModal={setShowModal}
          listing={currentListing as typeof data[0]}
        />
      ) : null}
      <ToastContainer />
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
                    <td className="px-6 py-4" {...cell.getCellProps()} key={i}>
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
            1-{page.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.length}
          </span>
        </span>
        <ul className="inline-flex items-center -space-x-px">
          <li onClick={previousPage}>
            <a
              href="#"
              className="ml-0 block rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </li>
          {[
            pageIndex - 2,
            pageIndex - 1,
            pageIndex,
            pageIndex + 1,
            pageIndex + 2,
          ]
            .filter((pageNo) => pageNo > 0 && pageNo <= pageOptions.length)
            .map((page) => {
              return (
                <li
                  key={page}
                  onClick={() => {
                    gotoPage(page - 1);
                  }}
                >
                  <a
                    href="#"
                    className="border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {page}
                  </a>
                </li>
              );
            })}
          <li onClick={nextPage}>
            <a
              href="#"
              className="block rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ListingTable;
