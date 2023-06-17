import type { NextPage } from "next";
import SearchSidebar from "../../components/listings/SearchSidebar";

const listingss: NextPage = () => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <SearchSidebar />
        <div className="grid lg:grid-cols-4 md:grid-cols-3"></div>
      </div>
    </div>
  );
};

export default listingss;
