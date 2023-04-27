import { useEffect, useState, Fragment } from "react";
import { trpc } from "../../utils/trpc";
import ModalBackDrop from "../modals/ModalBackdrop";
import Select from "react-select";
import LoadingButton from "../LoadingButton";
import { Combobox, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import type { Car } from "@prisma/client";
import { Input } from "../ui/input";

interface EbayModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  listing: any;
  refetch: () => void;
}

type FulfillmentPolicyType = {
  name: string;
  marketplaceId: string;
  categoryTypes: {
    name: string;
    default: boolean;
  }[];
  handlingTime: {
    value: number;
    unit: string;
  };
  shipToLocations: {
    regionIncluded: {
      regionName: string;
    }[];
  };
  shippingOptions: (
    | {
        optionType: string;
        costType: string;
        shippingServices: {
          sortOrder: number;
          shippingCarrierCode: string;
          shippingServiceCode: string;
          shippingCost: {
            value: string;
            currency: string;
          };
          additionalShippingCost: {
            value: string;
            currency: string;
          };
          freeShipping: boolean;
          buyerResponsibleForShipping: boolean;
          buyerResponsibleForPickup: boolean;
        }[];
        rateTableId: string;
        shippingDiscountProfileId: string;
        shippingPromotionOffered: boolean;
      }
    | {
        optionType: string;
        costType: string;
        shippingServices: {
          sortOrder: number;
          shippingCarrierCode: string;
          shippingServiceCode: string;
          shippingCost: {
            value: string;
            currency: string;
          };
          additionalShippingCost: {
            value: string;
            currency: string;
          };
          freeShipping: boolean;
          shipToLocations: {
            regionIncluded: {
              regionName: string;
            }[];
          };
          buyerResponsibleForShipping: boolean;
          buyerResponsibleForPickup: boolean;
        }[];
        rateTableId: string;
        shippingDiscountProfileId: string;
        shippingPromotionOffered: boolean;
      }
  )[];
  globalShipping: boolean;
  pickupDropOff: boolean;
  localPickup: boolean;
  freightShipping: boolean;
  fulfillmentPolicyId: string;
};

const EbayModal: React.FC<EbayModalProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  listing,
  refetch,
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
  const [createNewFulfillmentPolicy, setCreateNewFulfillmentPolicy] =
    useState<boolean>(false);
  const [fulfillmentPolicy, setFulfillmentPolicy] =
    useState<FulfillmentPolicyType | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const createEbayListing = trpc.ebay.createListing.useMutation();
  const fulfillmentPolicies = trpc.ebay.getFulfillmentPolicies.useQuery();
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

  const makeTableHTML = () => {
    return listing.parts
      .reduce((acc: any, cur: any) => {
        if (
          !acc.some(
            (part: any) =>
              part.partDetails.cars[0].id === cur.partDetails.cars[0]?.id
          )
        ) {
          acc.push(cur);
        }
        return acc;
      }, [] as any[])
      .map((part: any) => {
        return part.partDetails.cars.map((car: Car) => {
          return (
            `<tr style="padding:1rem;"><td>${car.series}</td><td>${car.generation}</td><td>${car.model}</td></tr>`
          );
        });
      }).join("");
  };

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
      images: listing.images.map((image: any) => image.url),
      condition: condition,
      conditionDescription: ebayCondition.value,
      quantity: quantity,
      partNo: listing.parts[0]?.partDetails.partNo as string,
      categoryId: categoryId,
      domesticShipping: domesticShipping,
      internationalShipping: internationalShipping,
      fulfillmentPolicyId: fulfillmentPolicy?.fulfillmentPolicyId,
      partsTable: `<table style="padding:1rem; text-align:center;"><thead><tr><th style="padding:1rem;">Make</th><th>Generation</th><th>Model</th></tr></thead><tbody>${makeTableHTML()}</tbody></table>`,
    });
    if (result) {
    }
    refetch();
    setShowModal(false);
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
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={description}
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="">
              <Input
                value={condition}
                placeholder="Condition (Will be apended to description)"
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
                value={categoryIds.data?.find(
                  (c: any) => c.value === categoryId
                )}
                options={categoryIds.data}
                onChange={(e: any) => setCategoryId(e.value)}
              />
            </div>
            <div className="">
              <Input
                value={price || undefined}
                type="number"
                placeholder="Price"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="">
              <Input
                value={quantity || undefined}
                type="number"
                placeholder="Quantity"
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            {createNewFulfillmentPolicy ? (
              <>
                <div className="flex">
                  <Input
                    value={domesticShipping}
                    placeholder="Domestic shipping"
                    onChange={(e) =>
                      setDomesticShipping(Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex">
                  <Input
                    value={internationalShipping}
                    placeholder="International shipping"
                    onChange={(e) =>
                      setInternationalShipping(Number(e.target.value))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <Combobox
                  value={fulfillmentPolicy}
                  onChange={setFulfillmentPolicy}
                >
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(policy: FulfillmentPolicyType) =>
                          fulfillmentPolicy?.name ||
                          "Select a fulfillment policy"
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <BiChevronDown
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {fulfillmentPolicies.data?.length === 0 ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          fulfillmentPolicies.data?.map(
                            (policy: FulfillmentPolicyType) => (
                              <Combobox.Option
                                key={policy.fulfillmentPolicyId}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-teal-600 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={policy}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {policy.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-white"
                                            : "text-teal-600"
                                        }`}
                                      ></span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            )
                          )
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
                <a
                  onClick={() => {
                    setFulfillmentPolicy(null);
                    setCreateNewFulfillmentPolicy(true);
                  }}
                  className="
            block cursor-pointer text-sm text-blue-500 hover:text-blue-700 hover:underline
            "
                >
                  Create new shipping policy
                </a>
              </>
            )}
            <LoadingButton onClick={onSubmit} loading={loading} text="List" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbayModal;
