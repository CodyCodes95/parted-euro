import React from "react";

interface AddCarFormSectionProps {
  title: string;
  data: any;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const AddCarFormSection: React.FC<AddCarFormSectionProps> = ({ title, data, value, setValue }) => {
  
  const [newValue, setNewValue] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState([])

  React.useEffect(() => {
    setOptions(data)
  }, [])

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </label>
      <div className="flex">
        <select
          onChange={(e) => setValue(e.target.value)}
          className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            newValue ? "hidden" : "visible"
          }`}
        >
          <option value="">{title}</option>
          {data?.map((item: any, i:number) => (
            <option key={i} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            newValue ? "visible" : "hidden"
          }`}
        />
        <button onClick={() => setNewValue(!newValue)} className="rounded-full bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-700 dark:focus:ring-blue-700">
          {newValue ? "Cancel" : "+"}
        </button>
      </div>
    </div>
  );
};

export default AddCarFormSection;
