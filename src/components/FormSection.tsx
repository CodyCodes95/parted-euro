import React from "react";

interface FormSectionProps {
  title: string;
  data: any;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  data,
  value,
  setValue,
  disabled = false,
}) => {
  const [newValue, setNewValue] = React.useState<boolean>(false);

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </label>
      <div className="flex">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            newValue ? "hidden" : "visible"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <option value="">{title}</option>
          {data?.map((item: any, i: number) => (
            <option key={i} value={item.value || item}>
              {item.label || item}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
            newValue ? "visible" : "hidden"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        />
        <button
          onMouseDown={() => setNewValue(!newValue)}
          disabled={disabled}
          className={`rounded-full bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-700 dark:focus:ring-blue-700 ${
            disabled ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {newValue ? "Cancel" : "+"}
        </button>
      </div>
    </div>
  );
};

export default FormSection;
