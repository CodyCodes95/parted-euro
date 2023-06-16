import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Ebay: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const [offer, setOffer] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const getPayment = trpc.ebay.getPaymentPolicy.useMutation();
  const getReturn = trpc.ebay.getReturnPolicy.useMutation();
  const getMerchant = trpc.ebay.createInventoryLocation.useMutation();
  const getFulfillment = trpc.ebay.getFulfillmentPolicies.useQuery();
  const publishOffer = trpc.ebay.publishOffer.useMutation();
  const getOffer = trpc.ebay.getOffer.useQuery(
    {
      id: offer,
    },
    {
      enabled: false,
      onSuccess: (data) => console.log(data),
    }
  );
  const getOffers = trpc.ebay.getOffers.useQuery(
    {
      sku: sku,
    },
    {
      enabled: false,
      onSuccess: (data) => console.log(data),
    }
  );

  const getReturnId = async () => {
    const res = await getReturn.mutateAsync();
    console.log(res);
    navigator.clipboard.writeText(res);
    toast.info("Copied to clipboard");
  };

  const getPaymentId = async () => {
    const res = await getPayment.mutateAsync();
    navigator.clipboard.writeText(res);
    toast.info("Copied to clipboard");
  };

  const getMerchantName = async () => {
    const res = await getMerchant.mutateAsync();
    navigator.clipboard.writeText(res);
    toast.info("Copied to clipboard");
  };

  const getShippingPolicies = async () => {
    // const res = await getFulfillment.mutateAsync();
    console.log("1");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div>
        <button
          onClick={getReturnId}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get returns policy
        </button>
        <button
          onClick={getPaymentId}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Payment ID
        </button>
        <button
          onClick={getMerchantName}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Merchant Key
        </button>
        <button
          onClick={getShippingPolicies}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get policies
        </button>
        <input
          type="text"
          value={offer}
          placeholder="Offer ID"
          onChange={(e) => setOffer(e.target.value)}
        />
        <button
          onClick={() => getOffer.refetch()}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Offer
        </button>
        <button
          onClick={async() => {
            const res = await publishOffer.mutateAsync({
              offerId: offer,
            });
            console.log(res)
          }}
          className="mr-2 mb-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-blue-800"
        >
          PUBLISH Offer
        </button>
      </div>
      <div>
        <input
          type="text"
          value={sku}
          placeholder="SKU"
          onChange={(e) => setSku(e.target.value)}
        />
        <button
          onClick={() => getOffers.refetch()}
          className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Offer
        </button>
      </div>
    </div>
  );
};

export default Ebay;
