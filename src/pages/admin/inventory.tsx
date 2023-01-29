import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { trpc } from "../../utils/trpc";
import { Part } from "@prisma/client";
import AddPart from "../../components/parts/AddPart";
import { useTable } from "react-table";

const Inventory: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.parts.getAll.useQuery();

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Series",
        accessor: "donor.car.series",
      },
    ],
    []
  );

  const data = useMemo(
    () => [
      {
        id: "clclirc3b000eeh0523gwg3u6",
        partDetailsId: "52207903035",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T08:25:37.052Z",
        donorVin: "WBSBL92060JR08716",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "52207903035",
          name: "E46 M3 Rear Seat Lateral Trim Panel Left",
          createdAt: "2023-01-07T05:42:10.924Z",
          updatedAt: "2023-01-07T05:42:10.924Z",
        },
        donor: {
          vin: "WBSBL92060JR08716",
          cost: 23000,
          year: 2003,
          mileage: 141000,
          carId: "clclirat80000eh05258blga3",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80000eh05258blga3",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000feh0521qaomtv",
        partDetailsId: "52207903036",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBSBL92060JR08716",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "52207903036",
          name: "E46 M3 Rear Seat Lateral Trim Panel Right",
          createdAt: "2023-01-07T05:42:11.136Z",
          updatedAt: "2023-01-07T05:42:11.136Z",
        },
        donor: {
          vin: "WBSBL92060JR08716",
          cost: 23000,
          year: 2003,
          mileage: 141000,
          carId: "clclirat80000eh05258blga3",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80000eh05258blga3",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000geh057wijkzud",
        partDetailsId: "51417890952",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBSBL92060JR08716",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "51417890952",
          name: "E46 M3 Door Cards Driver Front",
          createdAt: "2023-01-07T05:42:11.277Z",
          updatedAt: "2023-01-07T05:42:11.277Z",
        },
        donor: {
          vin: "WBSBL92060JR08716",
          cost: 23000,
          year: 2003,
          mileage: 141000,
          carId: "clclirat80000eh05258blga3",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80000eh05258blga3",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000heh05f0scw8t5",
        partDetailsId: "51417890951",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBSBL92060JR08716",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "51417890951",
          name: "E46 M3 Door Cards Passenger Front",
          createdAt: "2023-01-07T05:42:11.448Z",
          updatedAt: "2023-01-07T05:42:11.448Z",
        },
        donor: {
          vin: "WBSBL92060JR08716",
          cost: 23000,
          year: 2003,
          mileage: 141000,
          carId: "clclirat80000eh05258blga3",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80000eh05258blga3",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000ieh05d38pxbkq",
        partDetailsId: "51437890784",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBSBL92060JR08716",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "51437890784",
          name: "E46 M3 Door Cards Passenger Driver Rear",
          createdAt: "2023-01-07T05:42:11.575Z",
          updatedAt: "2023-01-07T05:42:11.575Z",
        },
        donor: {
          vin: "WBSBL92060JR08716",
          cost: 23000,
          year: 2003,
          mileage: 141000,
          carId: "clclirat80000eh05258blga3",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80000eh05258blga3",
            make: "BMW",
            series: "3 Series",
            generation: "E46",
            model: "M3",
            body: "Coupe",
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000jeh05c0xz6a37",
        partDetailsId: "11121702856",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBADN22000GE68930",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "11121702856",
          name: "Cylinder Head Cover Right",
          createdAt: "2023-01-07T05:42:11.703Z",
          updatedAt: "2023-01-07T05:42:11.703Z",
        },
        donor: {
          vin: "WBADN22000GE68930",
          cost: 15000,
          year: 1999,
          mileage: 220000,
          carId: "clclirat80004eh050zyaeb58",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80004eh050zyaeb58",
            make: "BMW",
            series: "5 Series",
            generation: "E39",
            model: "535i",
            body: null,
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000keh05heaowv3y",
        partDetailsId: "11121702857",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBADN22000GE68930",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "11121702857",
          name: "Cylinder Head Cover Left",
          createdAt: "2023-01-07T05:42:11.830Z",
          updatedAt: "2023-01-07T05:42:11.830Z",
        },
        donor: {
          vin: "WBADN22000GE68930",
          cost: 15000,
          year: 1999,
          mileage: 220000,
          carId: "clclirat80004eh050zyaeb58",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat80004eh050zyaeb58",
            make: "BMW",
            series: "5 Series",
            generation: "E39",
            model: "535i",
            body: null,
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000leh05jemp94qx",
        partDetailsId: "11121702857",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBS3R922090K345058",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "11121702857",
          name: "Cylinder Head Cover Left",
          createdAt: "2023-01-07T05:42:11.830Z",
          updatedAt: "2023-01-07T05:42:11.830Z",
        },
        donor: {
          vin: "WBS3R922090K345058",
          cost: 30000,
          year: 2016,
          mileage: 24000,
          carId: "clclirat8000ceh05rzc1eqs0",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat8000ceh05rzc1eqs0",
            make: "BMW",
            series: "F Series",
            generation: "F82",
            model: "M4",
            body: null,
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000meh05plyud68w",
        partDetailsId: "64229346226",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBS3R922090K345058",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "64229346226",
          name: "F8X M3 / M4 Passenger Air Vent",
          createdAt: "2023-01-07T05:42:12.090Z",
          updatedAt: "2023-01-07T05:42:12.090Z",
        },
        donor: {
          vin: "WBS3R922090K345058",
          cost: 30000,
          year: 2016,
          mileage: 24000,
          carId: "clclirat8000ceh05rzc1eqs0",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat8000ceh05rzc1eqs0",
            make: "BMW",
            series: "F Series",
            generation: "F82",
            model: "M4",
            body: null,
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clclirc3c000neh05uatcj5n0",
        partDetailsId: "64229346226",
        createdAt: "2023-01-07T05:42:12.216Z",
        updatedAt: "2023-01-07T05:42:12.216Z",
        donorVin: "WBS8M920105G47739",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "64229346226",
          name: "F8X M3 / M4 Passenger Air Vent",
          createdAt: "2023-01-07T05:42:12.090Z",
          updatedAt: "2023-01-07T05:42:12.090Z",
        },
        donor: {
          vin: "WBS8M920105G47739",
          cost: 40000,
          year: 2015,
          mileage: 21000,
          carId: "clclirat8000beh05e3xh81rk",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat8000beh05e3xh81rk",
            make: "BMW",
            series: "F Series",
            generation: "F80",
            model: "M3",
            body: null,
          },
        },
        inventoryLocation: null,
      },
      {
        id: "clcm3506m0000ehsa4mlf6u3x",
        partDetailsId: "65139226357",
        createdAt: "2023-01-07T15:12:42.285Z",
        updatedAt: "2023-01-07T15:12:42.285Z",
        donorVin: "WBS8M920105G47739",
        sold: false,
        soldPrice: null,
        soldParentPrice: null,
        inventoryLocationsId: null,
        partDetails: {
          partNo: "65139226357",
          name: "Harman Kardon Tweeter Front Door Speaker w/ Cover",
          createdAt: "2023-01-07T14:11:24.485Z",
          updatedAt: "2023-01-07T14:11:24.485Z",
        },
        donor: {
          vin: "WBS8M920105G47739",
          cost: 40000,
          year: 2015,
          mileage: 21000,
          carId: "clclirat8000beh05e3xh81rk",
          createdAt: "2023-01-07T05:42:10.838Z",
          updatedAt: "2023-01-17T07:26:10.007Z",
          imageUrl:
            "https://res.cloudinary.com/codycodes/image/upload/v1673939701/ScreenShot2022-08-26at12.44.09pm_r1rzfv.webp",
          car: {
            id: "clclirat8000beh05e3xh81rk",
            make: "BMW",
            series: "F Series",
            generation: "F80",
            model: "M3",
            body: null,
          },
        },
        inventoryLocation: null,
      },
    ],
    []
  );
  // const tableData = useMemo(() => parts.data, [parts.data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <main className="m-20 flex min-h-screen flex-col bg-white">
        {showModal ? (
          <AddPart
            success={success}
            error={error}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        ) : null}
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            {/* <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              data-dropdown-toggle="dropdownAction"
              className="m-2 inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              type="button"
            >
              <span className="sr-only">Action button</span>
              Action
              <svg
                className="ml-2 h-3 w-3"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button> */}
            <button
              className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => setShowModal(true)}
            >
              Add Inventory Item
            </button>
            <div
              className={`z-10 ${
                showActionMenu ? "" : "hidden"
              } absolute w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:divide-gray-600 dark:bg-gray-700`}
            >
              <ul
                className="py-1 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownActionButton"
              >
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Reward
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Promote
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Activate account
                  </a>
                </li>
              </ul>
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Delete User
                </a>
              </div>
            </div>
          </div>
          <label className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="table-search-users"
              className="block w-80 rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search for parts"
            />
          </div>
        </div>
        <div>
          <table
            className="w-full text-left text-sm text-gray-500 dark:text-gray-400"
            {...getTableProps()}
          >
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th className="px-6 py-3" {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td className="px-6 py-4" {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Inventory;
