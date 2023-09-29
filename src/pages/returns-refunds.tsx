import { NextPage } from "next";

const Returns: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full rounded-lg bg-white p-10 shadow-lg md:w-4/5 lg:w-3/4 m-4">
        <h1 className="mb-8 text-center text-4xl font-semibold">
          Warranty & Return Policy
        </h1>

        <p className="mb-4 font-bold">
          All items sold by Parted Euro for their listed price do not include
          any forms of warranty or insurance.
        </p>

        <p className="mb-4">
          Parted Euro offers a 30 day warranty for any requested item, at an
          additional 20% to be added to the cost.
        </p>

        <p className="mb-4 italic">
          For example; if an item is $300, warranty can be requested - bringing
          the total cost to $360 inclusive of warranty.
        </p>

        <p className="mb-4">
          <span className="font-bold">
            Strictly no returns will be accepted after 30 days from the dated
            invoice.
          </span>{" "}
          If your item was shipped to you, we will go off the delivery date from
          the shipment tracking.
        </p>

        <p className="mb-4 font-bold underline">
          Any USED item that is related to Brakes, Hydraulics or Electronics are
          EXCLUDED from all warranties.
        </p>

        <p className="mb-4">
          We view Brakes and Hydraulics as a safety item. Due to these being
          used parts, we cannot foresee the durability and reliability of these
          products, and therefore cannot guarantee their lasting performance.
          All used items that fit these categories will have a detailed
          description of their condition. Buyer agrees to these terms by
          purchasing any brake and hydraulic related item.
        </p>

        <p className="mb-4">
          Electronic components can potentially appear faulty, or be damaged
          upon install due to other external sources interfering. For this
          reason, we cannot offer warranty on any electrical products. Buyer
          agrees to these terms by purchasing any electronic related item.
        </p>

        <p className="mb-4">
          If an item is returned under warranty within the 30 day period, we
          will aim to source you a replacement, free of charge. If we cannot
          find a suitable replacement, a 20% restocking fee will incur.
        </p>

        <p className="mb-4 italic underline">
          For example, if an item was $360 inclusive of warranty, your returned
          amount will be $300 (the total sum of the parts value).
        </p>

        <h2 className="mb-3 text-xl font-bold">
          Parted Euro will warrant/return an item if the following terms are
          met:
        </h2>
        <ul className="mb-4 list-disc pl-5">
          <li>
            The part(s) purchased has outstanding physical damage which was not
            mentioned in the listing.
          </li>
          <li>
            The part(s) supplied are not as described, or does not suit the part
            number/VIN we have listed.
          </li>
        </ul>

        <h2 className="mb-3 text-xl font-bold">
          Parted Euro will REFUSE a warranty/return on an item if:
        </h2>
        <ul className="mb-4 list-disc pl-5">
          <li>The part(s) have been opened, modified or tampered with.</li>
          <li>
            The part(s) show signs of incorrect installation, or have been
            damaged in an attempt to install them.
          </li>
          <li>The part(s) have malfunctioned due to carelessness.</li>
          <li>
            The part(s) have been painted, sanded, primed or altered in any way.
          </li>
        </ul>

        <p className="mb-4 font-bold">
          Parted Euro takes ZERO RESPONSIBILITY for loss or damage of parts
          through freight. It is strongly suggested that freighted parts are
          insured. Please contact us if you would like to take insurance on
          freight of any item sent.
        </p>
      </div>
    </div>
  );
};

export default Returns;
