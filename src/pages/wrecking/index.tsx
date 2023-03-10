import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";

const Wrecking: NextPage = () => {
  const router = useRouter();

  const { series, generation, model } = router.query;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  const [search, setSearch] = useState<string | string[]>(
    router.query.search || ""
  );

  const [debouncedSearch] = useDebounce(search, 500);

  const donors = trpc.donors.getAllCurrentlyWrecking.useQuery();

  return (
    <div className="flex min-h-screen w-full flex-col p-24">
      <div className="flex w-full items-center justify-center">
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[33%]"
          label="Search"
          id="fullWidth"
        />
        <div className="relative">
          <SearchIcon className="absolute top-[-9px] right-2" />
        </div>
      </div>
      <div className="flex w-full items-center p-4">
        {donors.data?.map((donor) => (
          <Link
            key={donor.vin}
            className="group m-6 flex h-[740px] w-[22%] cursor-pointer flex-col justify-between"
            href={`wrecking/wreck?vin=${donor.vin}`}
          >
            <div className="max-h-[634px]">
              <img
                src={donor.imageUrl || ""}
                className="h-full duration-100 ease-linear group-hover:scale-105"
                alt=""
              />
            </div>
            <div className="flex flex-col">
              <p className="max-w-fit border-b-2 border-transparent group-hover:border-b-2 group-hover:border-black">
                {donor.year} {donor.car.generation} {donor.car.model}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Wrecking;
