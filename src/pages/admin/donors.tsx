import { type NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import AddDonor from "../../components/donors/AddDonor";
import SortedTable from "../../components/tables/SortedTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Donors: NextPage = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [headCells, setHeadCells] = useState<readonly string[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const success = (message: string) => toast.success(message);
  
  const error = (message: string) => toast.error(message)

  const donors = trpc.donors.getAllDashboard.useQuery(
    {},
    {
      onSuccess: (data) => {
        setRows([]);
        const hideColumns = ["updatedAt", "Part", "car"];
        const nestedColumns = [{ car: ["series", "generation", "model"] }];
        setHeadCells((): any => {
          const cells = Object.keys(data[0] as any)
            .filter((key: string) => {
              if (hideColumns.includes(key)) return false;
              if (nestedColumns[key as any]) return false;
              return true;
            })
            .map((key: any) => {
              return {
                disablePadding: false,
                id: key,
                numeric: false,
                label: key,
              };
            });
          nestedColumns.forEach((nestedColumn) => {
            Object.values(nestedColumn).forEach((nestedColumnValue) => {
              nestedColumnValue.forEach((nestedColumnValueValue) => {
                cells.splice(2, 0, {
                  disablePadding: false,
                  id: nestedColumnValueValue,
                  numeric: false,
                  label: nestedColumnValueValue,
                });
              });
            });
          });
          cells.push(
            {
              disablePadding: false,
              id: "totalSoldParts",
              numeric: true,
              label: "Total Sold Parts",
            },
            {
              disablePadding: false,
              id: "totalUnsoldParts",
              numeric: true,
              label: "Total Unsold Parts",
            }
          );
          return cells;
        });
        const newRows = data?.map((donor) => {
          return {
            vin: donor.vin,
            year: donor.year,
            mileage: `${donor.mileage}KM`,
            cost: donor.cost,
            createdAt: new Date(donor.createdAt).toLocaleDateString(),
            series: donor.car.series,
            generation: donor.car.generation,
            model: donor.car.model,
            parts: `${donor.parts.length} Parts`,
            totalUnsoldParts: donor.parts
              .reduce((acc, cur: any) => {
                if (cur.listing.length === 0) return acc;
                if (!acc.some((part) => part.listing.id === cur.listing.id)) {
                  acc.push(cur);
                }
                return acc;
              }, [] as any[])
              .reduce((acc, part) => {
                if (part.sold) return acc;
                const listingsTotal = part?.listing?.reduce(
                  (accum: number, listing: any) => {
                    if (listing.active) return accum + listing.price;
                    return accum;
                  },
                  0
                );
                return listingsTotal + acc;
              }, 0),
            totalSoldParts: donor.parts.reduce((acc, part) => {
              if (part.soldPrice === null || !part.sold) return acc;
              return part.soldPrice + acc;
            }, 0),
            // totalListedParts: donor.parts.reduce((acc, part) => {
            //   if (part.listing === null) return acc;
            //   const listingsTotal = part?.listing?.reduce((accum, listing) => {
            //     return accum + listing.price;
            //   }, 0);
            //   return listingsTotal + acc;
            // }, 0),
          };
        });
        setRows(newRows);
      },
    }
  );

  useEffect(() => {
    console.log(rows);
  }, [rows]);

  return (
    <>
      <Head>
        <title>Donors</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <ToastContainer />
        {showModal ? (
          <AddDonor success={success} error={error} showModal={showModal} setShowModal={setShowModal} />
        ) : null}
        <SortedTable
          headCells={headCells}
          rows={rows}
          title={"Donors"}
          rowId={"vin"}
          setShowModal={setShowModal}
        />
      </main>
    </>
  );
};

export default Donors;
