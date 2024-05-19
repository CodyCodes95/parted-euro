import { useEffect, useState, Fragment } from "react";
import type { QueryListingsGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import Select from "react-select";
import { Combobox, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import type { Car, Part, PartDetail } from "@prisma/client";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import Modal from "../modals/Modal";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

interface EbayModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  listing: QueryListingsGetAllAdmin;
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
  listing,
  refetch,
}) => {
  const [title, setTitle] = useState<string>(
    `${listing.title} ${listing.parts[0]?.partDetails.partNo}`,
  );
  const [description, setDescription] = useState<string>(listing.description);
  const [condition, setCondition] = useState<string>(listing.condition);
  const [price, setPrice] = useState<number>(
    Math.ceil(listing.price * 0.15 + listing.price),
  );
  const [ebayCondition, setEbayCondition] = useState<any>("");
  const [validated, setValidated] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [domesticShipping, setDomesticShipping] = useState<number>(0);
  const [internationalShipping, setInternationalShipping] = useState<number>(0);
  const [createNewFulfillmentPolicy, setCreateNewFulfillmentPolicy] =
    useState<boolean>(false);
  const [fulfillmentPolicy, setFulfillmentPolicy] =
    useState<FulfillmentPolicyType | null>(null);
  const [quantity, setQuantity] = useState<number>(
    listing.parts.every((part) => {
      const partNumber = listing.parts[0]?.partDetailsId;
      return part.partDetailsId === partNumber;
    })
      ? listing.parts.reduce((acc, cur) => {
          acc += cur.quantity;
          return acc;
        }, 0)
      : 1,
  );

  const createEbayListing = trpc.ebay.createListing.useMutation();
  const fulfillmentPolicies = trpc.ebay.getFulfillmentPolicies.useQuery();
  const categoryIds = trpc.ebay.getCategoryIds.useQuery({
    title: title,
  });

  type ListingParts = Part & {
    partDetails: PartDetail & {
      cars: Car[];
    };
  };

  const makeTableHTML = () => {
    return listing.parts
      .reduce((acc, cur) => {
        if (
          !acc.some(
            (part) =>
              part.partDetails.cars[0]!.id === cur.partDetails.cars[0]?.id,
          )
        ) {
          acc.push(cur);
        }
        return acc;
      }, [] as ListingParts[])
      .map((part) => {
        return part.partDetails.cars.map((car: Car) => {
          return `<tr style="padding:1rem; border-bottom: 1px solid #ddd"><td>${car.series}</td><td>${car.generation}</td><td>${car.model}</td></tr>`;
        });
      })
      .join("");
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
    const result = await createEbayListing.mutateAsync({
      listingId: listing.id,
      title: title,
      price: price,
      description: description,
      images: listing.images.map((image) => image.url),
      condition: condition,
      conditionDescription: ebayCondition.value,
      quantity: quantity,
      partNo: listing.parts[0]?.partDetails.partNo as string,
      categoryId: categoryId,
      domesticShipping: domesticShipping,
      internationalShipping: internationalShipping,
      fulfillmentPolicyId: fulfillmentPolicy?.fulfillmentPolicyId,
      partsTable: `<table style="padding:1rem; text-align:center; max-width:40rem;"><thead><tr style="border-bottom: 1px solid #ddd"><th style="padding:1rem;">Series</th><th>Generation</th><th>Model</th></tr></thead><tbody>${makeTableHTML()}</tbody></table>`,
    });
    refetch();
    setShowModal(false);
  };

  return (
    <Modal isOpen={showModal} setIsOpen={setShowModal} title="Ebay Listing">
      <div className="space-y-6 p-6">
        <div className="relative">
          <Input
            className="pb-5"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <span
            className={`absolute bottom-1 right-2 text-xs ${
              title.length > 80 && "text-red-600"
            }`}
          >
            {title.length}/80
          </span>
        </div>
        <div className="">
          <Textarea
            value={description}
            rows={4}
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
              { label: "Used", value: "USED_EXCELLENT" },
              {
                label: "For Parts Or Not Working",
                value: "FOR_PARTS_OR_NOT_WORKING",
              },
            ]}
            onChange={(e) => setEbayCondition(e)}
          />
        </div>
        <div className="">
          <Select
            placeholder="Ebay Category"
            value={categoryIds.data?.find((c: any) => c.value === categoryId)}
            options={categoryIds.data}
            onChange={(e) => setCategoryId(e.value)}
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
            <div className="cursor-auto bg-gray-200 p-2">
              <ChevronLeft
                onClick={() => setCreateNewFulfillmentPolicy(false)}
              />
            </div>
            <div className="flex">
              <Input
                value={domesticShipping}
                placeholder="Domestic shipping"
                onChange={(e) => setDomesticShipping(Number(e.target.value))}
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
            {/* <Combobox value={fulfillmentPolicy} onChange={setFulfillmentPolicy}>
              <div className="relative mt-1">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                  <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={() =>
                      fulfillmentPolicy?.name || "Select a fulfillment policy"
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
                                      active ? "text-white" : "text-teal-600"
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
            </Combobox> */}
            <Select
              placeholder="Select a fulfillment policy"
              value={fulfillmentPolicy}
              onChange={(e) => setFulfillmentPolicy(e)}
              options={fulfillmentPolicies.data?.map((policy: any) => {
                return {
                  label: policy.name,
                  value: policy.fulfillmentPolicyId,
                };
              })}
              className="basic-multi-select"
              classNamePrefix="select"
            />
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
        <Button onClick={onSubmit}>List</Button>
      </div>
    </Modal>
  );
};

export default EbayModal;
