import { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import Spacer from "../../components/Spacer";
import CartContext from "../../context/cartContext";

type CartItem = {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string | undefined;
  quantity: number;
};

const Confirmation: NextPage = () => {
  const { cart, setCart } = useContext(CartContext);
  const [tempCart, setTempCart] = useState<any[]>([]);

  useEffect(() => {
    if (cart.length) {
      setTempCart(cart);
      setCart([]);
    }
  }, [cart]);

  return (
    <div className="py-14 px-4 md:px-6 2xl:container 2xl:mx-auto 2xl:px-20">
      <div className="item-start flex flex-col justify-start space-y-2 ">
        <h1 className="text-3xl font-semibold leading-7 text-gray-800 lg:text-4xl  lg:leading-9">
          Order Confirmed
        </h1>
        <p className="text-base font-medium leading-6 text-gray-600">
          {new Date().toLocaleDateString()}
        </p>
      </div>
      <Spacer amount="2" />
      <div className="w-fill flex items-center justify-center">
        <p>Please check your email for your invoice.</p>
      </div>
      {/* <div className="jusitfy-center mt-10 flex w-full flex-col items-stretch  space-y-4 md:space-y-6 xl:flex-row xl:space-x-8 xl:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-4 md:space-y-6 xl:space-y-8">
          <div className="flex w-full flex-col items-start justify-start bg-gray-50 px-4 py-4 md:p-6 md:py-6 xl:p-8">
            <p className="text-lg font-semibold leading-6 text-gray-800 md:text-xl xl:leading-5">
              Your Order
            </p>
            <Spacer amount="3" />
            {tempCart.map((item: CartItem) => (
              <div
                key={item.listingTitle}
                className="mt-6 flex w-full flex-col items-start justify-start  space-y-4 md:mt-0 md:flex-row  md:items-center md:space-x-6 xl:space-x-8 "
              >
                <div className="w-full md:w-40">
                  <img
                    className="hidden w-full md:block"
                    src={item.listingImage}
                    alt={item.listingTitle}
                  />
                  <img
                    className="w-full md:hidden"
                    src={item.listingImage}
                    alt={item.listingTitle}
                  />
                </div>
                <div className="  flex w-full flex-col items-start justify-between space-y-4 md:flex-row md:space-y-0  ">
                  <div className="flex w-full flex-col items-start justify-start space-y-8">
                    <h3 className="text-xl font-semibold leading-6 text-gray-800 xl:text-2xl">
                      {item.listingTitle}
                    </h3>
                  </div>
                  <div className="flex w-full items-start justify-between space-x-8">
                    <p className="text-base leading-6 text-gray-800 xl:text-lg">
                      {item.quantity}
                    </p>
                    <p className="text-base font-semibold leading-6 text-gray-800 xl:text-lg">
                      ${item.listingPrice * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default Confirmation;
