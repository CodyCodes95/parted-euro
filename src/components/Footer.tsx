import Link from "next/link";
import { FaFacebookSquare } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";

const Footer: React.FC = () => {
  return (
    <div className="flex w-full flex-col items-center justify-around border-t-2 bg-zinc-100 p-6">
      <div className="flex flex-col items-center justify-between  md:flex-row">
        <div className="text-md flex flex-col justify-center p-4 text-[#4d4d4d] items-center">
          <h4 className="text-xl font-bold">
            Looking for something we don&apos;t have listed?
          </h4>
          <div className="p-2 text-xl"></div>
          <p>Feel free to call or email us at:</p>
          <p>Mobile: <a href="tel:0431133764">0431 133 764</a></p>
          <p>Email: <a href="mailto:contact@partedeuro.com.au">contact@partedeuro.com.au</a></p>
        </div>
        <div className="text-md flex w-full flex-col p-4 text-[#4d4d4d] md:w-[50%]">
          <p className="p-1">
            All products listed are available for pickup, as well as road
            freight Australia-wide (with very few products exempt from freight).
          </p>
          <p className="p-1">
            Pickup is available from our Knoxfield warehouse, located just 5
            minutes from Knox O-Zone and the Eastlink Freeway.
          </p>
          <p className="p-1 font-bold">
            Our Knoxfield warehouse is open via appointment only. Please contact
            us directly to organise a time to schedule a pickup.
          </p>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <Link href="https://www.facebook.com/partedeuro">
          <FaFacebookSquare className="h-8 w-8 duration-300 ease-in-out hover:fill-[#3b5998]" />
        </Link>
        <Link href="https://www.instagram.com/partedeuro/">
          <FiInstagram className="h-8 w-8 duration-300 ease-in-out hover:text-[#d62976]" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
