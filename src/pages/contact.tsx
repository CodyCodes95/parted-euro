import type { NextPage } from "next";

export const Paragraph = ({ children, classes }: any) => {
  return (
    <p
      className={`px-12 text-lg leading-10 tracking-wide text-[#4d4d4d] ${classes}`}
    >
      {children}
    </p>
  );
};

export const BoldPara = ({ children }: any) => {
  return (
    <p className="px-12 text-lg font-bold leading-10 tracking-[0.02em] text-[#4d4d4d]">
      {children}
    </p>
  );
};

const contact: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-4/5 rounded-lg bg-white p-10 shadow-lg md:w-1/2 lg:w-1/3">
        <h1 className="mb-5 text-center text-2xl font-semibold">
          Contact Details
        </h1>
        <p className="mb-2">
          <span className="font-semibold">Email: </span>
          contact@partedeuro.com.au
        </p>
        <p className="mb-2">
          <span className="font-semibold">Phone: </span>
          0412 371 588
        </p>
        <p className="mb-1 font-bold">Hours:</p>
        <p className="mb-2">Open via Appointment only.</p>
        <p className="mb-2">Monday to Friday</p>
        <p className="mb-4">8:30am - 5:30pm</p>
        <p className="mb-1 font-bold">Address:</p>
        <p className="mb-2">Rushdale Park</p>
        <p className="mb-2">Unit 2/26 Rushdale Street,</p>
        <p className="mb-2">Knoxfield, 3180</p>
        <p className="mb-4">Victoria, Australia</p>
        <p className="text-sm text-gray-600">
          (Unit 2 is located on the first left of the business park)
        </p>
      </div>
    </div>
  );
};

export default contact;
