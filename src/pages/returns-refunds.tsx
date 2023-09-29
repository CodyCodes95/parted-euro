import { NextPage } from "next"

export const Paragraph = ({ children, classes }:any) => {
  return <p className={`text-[#4d4d4d] text-lg px-12 tracking-wide leading-10 mb-8 ${classes}`}>{children}</p>;
};

export const ListPara = ({ children }: any) => {
  return <p className="mb-6 px-16 text-lg text-[#4d4d4d]">- {children}</p>;
};

export const BoldPara = ({ children }: any) => {
  return <p className="tracking-[0.02em] leading-10 mb-8 px-12 text-lg text-[#4d4d4d] font-bold">{children}</p>;
};

const Returns:NextPage = () => {
    return (
      <div className="flex w-full flex-col gap-4">
          <div className="flex w-full justify-center">
            <h1 className="text-center text-6xl">
              Warranty & Return Policy
            </h1>
          </div>
          <div className="flex w-full flex-col items-center text-center">
            <BoldPara>
              All items sold by Parted Euro for their listed price do not
              include any forms of warranty or insurance.
            </BoldPara>
            <Paragraph>
              Parted Euro offers a 30 day warranty for any requested item, at an
              additional 20% to be added to the cost.
            </Paragraph>
            <Paragraph>
              For example; if an item is $300, warranty can be requested -
              bringing the total cost to $360 inclusive of warranty.
            </Paragraph>
            <Paragraph>
              <span className="font-bold">
                Strictly no returns will be accepted after 30 days from the
                dated invoice.{" "}
              </span>
              If your item was shipped to you, we will go off the delivery date
              from the shipment tracking.
            </Paragraph>
            <BoldPara>
              Any <span className="underline">USED</span> item that is related
              to{" "}
              <span className="underline">
                Brakes, Hydraulics or Electronics are EXCLUDED
              </span>{" "}
              from all warranties.
            </BoldPara>
            <Paragraph>
              We view Brakes and Hydraulics as a safety item. Due to these being
              used parts, we cannot foresee the durability and reliability of
              these products, and therefore cannot guarantee their lasting
              performance. With this, we cannot offer warranties on these items.
              All used items that fit these categories will have a detailed
              description of their condition, whether they were in good &
              working order, or if condition was not known. Prices will reflect
              this. Buyer agrees to these terms by purchasing any brake and
              hydraulic related item.
            </Paragraph>
            <Paragraph>
              Electronic components can potentially appear faulty, or be damaged
              upon install due to other external sources interfering, if
              problems are incorrectly diagnosed. For this reason, we cannot
              offer warranty on any electrical products. All electronic used
              items will have a detailed description of their condition, whether
              they were in a good & working order, or if condition was not
              known. If applicable, photos of the electronic item will be shown
              for items. Buyer agrees to these terms by purchasing any
              electronic related item.
            </Paragraph>
            <Paragraph>
              If an item is returned under warranty within the 30 day period, we
              will aim to source you a replacement, free of charge. If we cannot
              find a suitable replacement, a 20% restocking fee will incur.
            </Paragraph>
            <Paragraph classes="underline">
              For example, if an item was $360 inclusive of warranty, your
              returned amount will be $300 (the total sum of the parts value).
            </Paragraph>
            <BoldPara>
              Parted Euro will warrant/return an item if the following terms are
              met:
            </BoldPara>
            <ListPara>
              The part(s) purchased has outstanding physical damage which was
              not mentioned / highlighted in the listing.
            </ListPara>
            <ListPara>
              The part(s) supplied are not as described, or does not suit the
              part number / VIN that we have listed. Note: This does not apply
              if you are trying to retrofit parts to a different car. This is
              only applicable if the part does not suit car(s) that we have
              noted it is suitable for.
            </ListPara>
            <BoldPara>
              Parted Euro will REFUSE a warranty / return on an item if:
            </BoldPara>
            <ListPara>
              The part(s) have been opened, modified or tampered with in any
              way, shape or form.
            </ListPara>
            <ListPara>
              The part(s) show signs of incorrect installation, or have been
              damaged in an attempt to install them.
            </ListPara>
            <ListPara>
              The part(s) have malfunctioned due to carelessness. (i.e -
              purchasing & installing an engine without checking oil levels).
            </ListPara>
            <ListPara>
              The part(s) have been painted, sanded, primed or altered in any
              way, shape or form.
            </ListPara>
            <BoldPara>
              Parted Euro takes ZERO RESPONSIBILITY for loss or damage of parts
              through freight. It is strongly suggested that freighted parts are
              insured. Please contact us if you would like to take insurance on
              freight of any item sent.{" "}
            </BoldPara>
          </div>
      </div>
    );
}

export default Returns