import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import { Input } from "@material-tailwind/react";
import LoadingButton from "../LoadingButton";
import { Image, Listing, Part, PartDetail } from "@prisma/client";

interface EbayModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  // listing: Listing & {
  //   parts: Part &
  //     {
  //       partDetails: PartDetail;
  //     }[];
  //   images: Image[];
  // };
  listing: any,
  refetch: () => void;
}

const EbayModal: React.FC<EbayModalProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  listing,
  refetch
}) => {
  const [title, setTitle] = useState<string>(listing.title);
  const [description, setDescription] = useState<string>(listing.description);
  const [condition, setCondition] = useState<string>(listing.condition);
  const [price, setPrice] = useState<number>(listing.price);
  const [loading, setLoading] = useState<boolean>(false);
  const [ebayCondition, setEbayCondition] = useState<any>("");
  const [validated, setValidated] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [domesticShipping, setDomesticShipping] = useState<number>(0);
  const [internationalShipping, setInternationalShipping] = useState<number>(0);

  const createEbayListing = trpc.ebay.createListing.useMutation();
  const categoryIds = trpc.ebay.getCategoryIds.useQuery(
    {
      title: title,
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );

  useEffect(() => {
    if (title && description && condition && price && ebayCondition) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  }, [title, description, condition, price, ebayCondition]);

  const onSubmit = async () => {
    if (!validated) return;
    setLoading(true);
    const result = await createEbayListing.mutateAsync({
      listingId: listing.id,
      title: title,
      price: price,
      description: description,
      images: listing.images.map((image:any) => image.url),
      condition: condition,
      conditionDescription: ebayCondition.value,
      quantity: 1,
      partNo: listing.parts[0]?.partDetails.partNo as string,
      categoryId: categoryId,
      domesticShipping: domesticShipping,
      internationalShipping: internationalShipping,
    });
    if (result) {
      
    }
    refetch()
    setLoading(false);
  };

  return (
    <div
      id="defaultModal"
      aria-hidden="true"
      className={`h-modal fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full ${
        showModal ? "" : "hidden"
      }`}
    >
      <ModalBackDrop setShowModal={setShowModal} />
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Ebay Listing
            </h3>
            <button
              onClick={() => setShowModal(!showModal) as any}
              type="button"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="defaultModal"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-6 p-6">
            <div className="">
              <Input
                value={title}
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={description}
                label="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={condition}
                label="Condition (Will be apended to description)"
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <div className="">
              <Select
                placeholder="Ebay Condition"
                value={ebayCondition}
                options={[
                  { label: "New", value: "NEW" },
                  { label: "Used Excellent", value: "USED_EXCELLENT" },
                  { label: "Used Very Good", value: "USED_VERY_GOOD" },
                  { label: "Used Good", value: "USED_GOOD" },
                  { label: "Used Acceptable", value: "USED_ACCEPTABLE" },
                ]}
                onChange={(e: any) => setEbayCondition(e)}
              />
            </div>
            <div className="">
              <Select
                placeholder="Ebay Category"
                value={categoryIds.data?.find((c:any) => c.value === categoryId)}
                options={categoryIds.data}
                onChange={(e: any) => setCategoryId(e.value)}
              />
            </div>
            <div className="">
              <Input
                value={price || undefined}
                type="number"
                label="Price"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="flex">
              <Input
                value={domesticShipping}
                label="Domestic shipping"
                onChange={(e) => setDomesticShipping(Number(e.target.value))}
              />
            </div>
            <div className="flex">
              <Input
                value={internationalShipping}
                label="International shipping"
                onChange={(e) => setInternationalShipping(Number(e.target.value))}
              />
            </div>
            <LoadingButton onClick={onSubmit} loading={loading} text="List" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbayModal;
