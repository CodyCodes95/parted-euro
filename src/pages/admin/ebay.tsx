import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../../components/ui/button";

const Ebay: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const [offer, setOffer] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
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
    },
  );
  const getOffers = trpc.ebay.getOffers.useQuery(
    {
      sku: sku,
    },
    {
      enabled: false,
      onSuccess: (data) => console.log(data),
    },
  );

  const getReturnId = async () => {
    const res = await getReturn.mutateAsync();
    console.log(res);
    navigator.clipboard.writeText(res);
    toast.success("Copied to clipboard");
  };

  const getPaymentId = async () => {
    const res = await getPayment.mutateAsync();
    navigator.clipboard.writeText(res);
    toast.success("Copied to clipboard");
  };

  const getMerchantName = async () => {
    const res = await getMerchant.mutateAsync();
    navigator.clipboard.writeText(res);
    toast.success("Copied to clipboard");
  };

  const getShippingPolicies = async () => {
    // const res = await getFulfillment.mutateAsync();
    console.log("1");
  };

  const updateQuantity = trpc.ebay.updateQuantity.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div>
        <button
          onMouseDown={getReturnId}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get returns policy
        </button>
        <button
          onMouseDown={getPaymentId}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Payment ID
        </button>
        <button
          onMouseDown={getMerchantName}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Merchant Key
        </button>
        <button
          onMouseDown={getShippingPolicies}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
          onMouseDown={() => getOffer.refetch()}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Offer
        </button>
        <button
          onMouseDown={async () => {
            const res = await publishOffer.mutateAsync({
              offerId: offer,
            });
            console.log(res);
          }}
          className="mb-2 mr-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-blue-800"
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
        <input
          type="text"
          value={quantity}
          placeholder="QUANTITY"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button
          onMouseDown={() => getOffers.refetch()}
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Get Offer
        </button>
        <Button
          onMouseDown={() => {
            const res = updateQuantity.mutateAsync({
              sku,
              quantity,
            });
            console.log(res);
          }}
        >
          Update Quantity
        </Button>
      </div>
    </div>
  );
};

export default Ebay;
