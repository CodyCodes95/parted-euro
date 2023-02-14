import { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Ebay: NextPage = () => {

    const getPayment = trpc.ebay.getPaymentPolicy.useMutation()
    const getReturn = trpc.ebay.getReturnPolicy.useMutation()
    const getMerchant = trpc.ebay.createInventoryLocation.useMutation()

    const getReturnId = async () => {
        const res = await getReturn.mutateAsync()
        console.log(res)
        navigator.clipboard.writeText(res);
        toast.info("Copied to clipboard")
    }

    const getPaymentId = async () => {
        const res = await getPayment.mutateAsync()
        navigator.clipboard.writeText(res)
        toast.info("Copied to clipboard")
    }

    const getMerchantName = async () => {
        const res = await getMerchant.mutateAsync()
        navigator.clipboard.writeText(res)
        toast.info("Copied to clipboard")
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <ToastContainer />
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
        <button onClick={getMerchantName} className="mr-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Create Merchant Key
        </button>
      </div>
    );
};

export default Ebay;