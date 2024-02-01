import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { AiOutlineSearch } from "react-icons/ai";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "../../components/ui/input";

const Wrecking: NextPage = () => {
  const router = useRouter();

  const { series, generation, model } = router.query;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  const [search, setSearch] = useState<string | string[]>(
    router.query.search || "",
  );

  const [debouncedSearch] = useDebounce(search, 500);

  const donors = trpc.donors.getAllCurrentlyWrecking.useQuery();

  return (
    <div className="flex min-h-screen w-full flex-col p-24">
      <div className="flex w-full items-center justify-center">
        <div className="relative flex w-1/2 items-center justify-center">
          <AiOutlineSearch className="absolute left-0 ml-1 text-xl" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7"
            placeholder="Search..."
          />
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
                src={donor.images[0]?.url || ""}
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
