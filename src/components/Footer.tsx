import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <div className="flex h-20 w-full flex-col items-center justify-around bg-white">
      <div className="flex">
        <div className="flex flex-col">
          <h4>Looking for something we don't have listed?</h4>
          <p>Feel free to call or email us at:</p>
          <p>Mobile: 0412 371 588</p>
          <p>Email: contact@partedeuro.com</p>
        </div>
        <div className="flex flex-col">
          <p>
            All products listed are available for pickup, as well as road
            freight Australia-wide (with very few products exempt from freight).
          </p>
          <p>
            Pickup is available from our Knoxfield warehouse, located just 5
            minutes from Knox O-Zone and the Eastlink Freeway.
          </p>
          <p>
            Our Knoxfield warehouse is open via appointment only. Please contact
            us directly to organise a time to schedule a pickup.
          </p>
        </div>
      </div>
      <div>
        <Link href="#">Facebook</Link>
        <Link href="#">Instagram</Link>
      </div>
    </div>
  );
};

export default Footer;
