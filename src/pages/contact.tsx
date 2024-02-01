import type { NextPage } from "next";

const contact: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
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
          0431 133 764
        </p>
        <p className="mb-1 font-bold">Hours:</p>
        <p className="mb-2">Open via Appointment only.</p>
        <p className="mb-2">Monday to Friday</p>
        <p className="mb-1 font-bold">Address:</p>
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
