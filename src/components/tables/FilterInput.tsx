import React, { FC } from 'react'
import { FaSearch } from 'react-icons/fa';
import { Input } from '../ui/input';

type FilterInputProps = {
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    placeholder: string
}

const FilterInput:FC<FilterInputProps> = ({filter, setFilter, placeholder}) => {
  return (
    <div className="relative">
      <label className="sr-only">Search</label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <FaSearch />
      </div>
      <Input
        className="w-80 pl-9"
        placeholder={placeholder}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
    </div>
  );
}

export default FilterInput