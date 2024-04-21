import type { FC } from "react";
import type { Column } from "react-table";
import Table from "./Table";
import LoadingSpinner from "../ui/Loader";
import TableControls from "./TablePageControls";

type AdminTableProps = {
  data: any;
  columns: Array<Column<any>>;
  filter?: string;
  setFilter?: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

const AdminTable: FC<AdminTableProps> = ({
  data,
  columns,
  filter,
  setFilter,
  currentPage,
  setCurrentPage,
}) => {
  if (data.isLoading) {
    return (
      <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TableControls
      filter={filter}
      setFilter={setFilter}
      columns={columns}
      data={data.data}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default AdminTable;
