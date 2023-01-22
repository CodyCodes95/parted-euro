import { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import CartContext from "../../context/cartContext";

const Confirmation: NextPage = () => {
    const { cart, setCart } = useContext(CartContext);
    const [tempCart, setTempCart] = useState<any[]>([]);

    useEffect(() => {
        setTempCart(cart)
        // setCart([])
    }, [])

    const createOrder = async () => {
        const res = await fetch("https://api.xero.com/api.xro/2.0/Invoices", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            cccept: "application/json",
            "xero-tenant-id": "x30partedeurodev",
            authorization: "",
          },
          body: JSON.stringify({}),
        });
    }


  return (
    <div>
      <div>Hello</div>
    </div>
  );
};

export default Confirmation;
