import Link from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer: React.FC = () => {
  return (
    <div className="flex w-full flex-col items-center justify-around border-t-2 bg-white p-6">
      <div className="flex justify-between">
        <div className="text-md flex flex-col justify-center p-4 text-[#4d4d4d]">
          <h4 className="text-xl font-bold">
            Looking for something we don&apos;t have listed?
          </h4>
          <div className="p-2 text-xl"></div>
          <p>Feel free to call or email us at:</p>
          <p>Mobile: 0412 371 588</p>
          <p>Email: contact@partedeuro.com</p>
        </div>
        <div className="text-md flex w-[50%] flex-col p-4 text-[#4d4d4d]">
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
      <div className="flex w-20 justify-between py-2">
        <Link href="https://www.facebook.com/partedeuro">
          <FacebookIcon className="h-8 w-8 duration-300 ease-in-out hover:fill-[#3b5998]" />
        </Link>
        <Link href="https://www.instagram.com/partedeuro/">
          <InstagramIcon className="h-8 w-8 duration-300 ease-in-out hover:fill-[#d62976]" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
