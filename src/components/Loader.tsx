import type { FC } from "react";
import loader from "../../public/loader.svg";

const LoadingSpinner: FC = () => {
  return (
    <div className="flex min-h-[30rem] w-full flex-col items-center justify-center p-24">
      <img className="h-80 w-80" src={loader.src} alt="Loading spinner" />
    </div>
  );
};

export default LoadingSpinner;
