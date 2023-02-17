import { NextPage } from "next";

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
    <p className="mt-8 px-12 text-lg font-bold leading-10 tracking-[0.02em] text-[#4d4d4d]">
      {children}
    </p>
  );
};

const contact: NextPage = () => {
  return (
    <div className="flex w-full flex-col items-center px-96">
      <div className="flex w-[75%] flex-col">
        <h1 className="mb-12 text-center text-6xl">Contact Information</h1>
        <div className="flex flex-col justify-center align-center text-center py-12">
          <Paragraph>
            <span>Email: </span>contact@partedeuro.com.au
          </Paragraph>
          <Paragraph>
            <span>Phone: </span>0412 371 588
          </Paragraph>
          <BoldPara>Hours:</BoldPara>
          <Paragraph>Open via Appointment only.</Paragraph>
          <Paragraph>Monday to Friday</Paragraph>
          <Paragraph>8:30am - 5:30pm</Paragraph>
          <Paragraph>Saturday</Paragraph>
          <BoldPara>Address:</BoldPara>
          <Paragraph>Rushdale Park</Paragraph>
          <Paragraph>Unit 2/26 Rushdale Street,</Paragraph>
          <Paragraph>Knoxfield, 3180</Paragraph>
          <Paragraph>Victoria, Australia</Paragraph>
          <Paragraph>
            (Unit 2 is located in the first left of the business park)
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default contact;
