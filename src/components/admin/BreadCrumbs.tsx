import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiHome, FiChevronRight, FiChevronDown } from "react-icons/fi";

// Define types for the component props
interface BreadCrumbsProps {
  // selectOptions is an object where keys are path segments and values are arrays of possible options
  selectOptions?: Record<string, string[]>;
}

// Type for handling path segments
type PathSegments = string[];

export const adminPages = [
  "cars",
  "categories",
  "donors",
  "inventory",
  "inventory-locations",
  "listings",
  "orders",
  "parts",
];

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ selectOptions = {} }) => {
  const router = useRouter();
  const [client, setClient] = useState<boolean>(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) return null;

  // Handle select change with typed parameters
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    pathSegments: PathSegments,
  ): void => {
    const newPath = [...pathSegments];
    newPath[newPath.length - 1] = e.target.value;
    router.push("/" + newPath.join("/"));
  };

  // Render breadcrumb item with typed parameters
  const renderBreadcrumbItem = (
    path: string,
    index: number,
    pathSegments: PathSegments,
  ): React.ReactNode => {
    const hasOptions =
      selectOptions[path] && Array.isArray(selectOptions[path]);

    if (hasOptions) {
      return (
        <div className="relative inline-flex items-center">
          <select
            value={path}
            onChange={(e) => handleSelectChange(e, pathSegments)}
            className="cursor-pointer appearance-none bg-transparent pr-8 font-medium text-gray-700 hover:text-blue-600 focus:outline-none dark:text-gray-400 dark:hover:text-white"
          >
            {selectOptions[path]?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
        </div>
      );
    }

    return (
      <Link
        href={`/${pathSegments.join("/")}`}
        className="inline-flex items-center font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
      >
        {path}
      </Link>
    );
  };

  const pathSegments: PathSegments = window.location.pathname
    .split("/")
    .filter((x) => x);

  return (
    <nav className="flex w-3/4 text-xl" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
          >
            <FiHome className="mr-2" />
            Home
          </Link>
        </li>
        <FiChevronRight />
        {pathSegments.map((path, index) => (
          <React.Fragment key={index}>
            <li className="inline-flex items-center">
              {renderBreadcrumbItem(
                path,
                index,
                pathSegments.slice(0, index + 1),
              )}
            </li>
            {index !== pathSegments.length - 1 && <FiChevronRight />}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default BreadCrumbs;
