import Link from "next/link";
import { FiHome, FiChevronRight } from "react-icons/fi";

const BreadCrumbs = () => {
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
        {window.location.pathname
          .split("/")
          .filter((x) => x)
          .map((path, index) => {
            return (
              <>
                <li className="inline-flex items-center" key={index}>
                  <Link
                    href={`/${window.location.pathname
                      .split("/")
                      .filter((x) => x)
                      .slice(0, index + 1)
                      .join("/")}`}
                    className="inline-flex items-center font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    {path}
                  </Link>
                </li>
                {index !==
                  window.location.pathname.split("/").filter((x) => x).length -
                    1 && <FiChevronRight />}
              </>
            );
          })}
      </ol>
    </nav>
  );
};

export default BreadCrumbs;
