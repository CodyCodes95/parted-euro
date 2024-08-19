import type { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { AiOutlineSearch } from "react-icons/ai";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";

const Wrecking: NextPage = () => {
  const router = useRouter();

  const { series, generation, model } = router.query;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  const [search, setSearch] = useState<string | string[]>(
    router.query.search ?? "",
  );

  const [debouncedSearch] = useDebounce(search, 500);

  const donors = trpc.donors.getAllCurrentlyWrecking.useQuery();
  return <p className="text-5xl">Big things coming</p>;

  // return (
  //   <div className="3xl:grid-cols-6 4xl:grid-cols-7 5xl:grid-cols-8 6xl:grid-cols-9 7xl:grid-cols-10 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
  //     {donors.data?.map((donor) => (
  //       <Card key={donor.vin}>
  //         <Link href={`/donors/donor?id=${donor.vin}`}>
  //           <CardContent className="p-0">
  //             <img
  //               alt="Product image"
  //               className="max-h-80 w-full rounded-md object-cover"
  //               src={donor.images[0]?.url}
  //             />
  //             <div className="p-2">
  //               <div className="mt-2 text-sm font-medium">
  //                 {donor.car.model }
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Link>
  //       </Card>
  //     ))}
  //   </div>
  // );
};

export default Wrecking;
