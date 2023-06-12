import type { FC } from "react";
import type { Column } from "react-table";
import loader from "../../../public/loader.svg";
import Table from "./Table";

type AdminTableProps = {
  data: any;
  columns: Array<Column<any>>;
  filter?: string;
  setFilter?: React.Dispatch<React.SetStateAction<string>>;
};

const AdminTable: FC<AdminTableProps> = ({
  data,
  columns,
  filter,
  setFilter,
}) => {
  if (data.isLoading) {
    return (
      <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
        <img className="h-60 w-60" src={loader.src} alt="Loading spinner" />
      </div>
    );
  }

  return (
    <Table
      filter={filter}
      setFilter={setFilter}
      columns={columns}
      data={data.data}
    />
  );
};

export default AdminTable;
