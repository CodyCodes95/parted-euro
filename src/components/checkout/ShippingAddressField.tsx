import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";

type ShippingAddress = {
  postCode: string;
};

interface ShippingAddressFieldProps {
  setShippingAddress: (address: ShippingAddress) => void;
}

const ShippingAddressField: React.FC<ShippingAddressFieldProps> = ({
  setShippingAddress,
}) => {
  const [options, setOptions] = useState<readonly PlaceType[]>([]);
  const [selection, setSelection] = useState<any | null>(null);

  interface MainTextMatchedSubstrings {
    offset: number;
    length: number;
  }
  interface StructuredFormatting {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: readonly MainTextMatchedSubstrings[];
  }
  interface PlaceType {
    description: string;
    structured_formatting: StructuredFormatting;
  }

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["(regions)"],
      componentRestrictions: {
        country: "AU",
      },
    },
    debounce: 300,
  });

  useEffect(() => {
    setOptions(data);
  }, [data]);

  useEffect(() => {
    const getAddressDetails = async () => {
      const results: any = await getDetails({
        placeId: selection?.place_id,
        fields: ["address_components"],
      });
      setShippingAddress({
        postCode: results.address_components.find((x: any) =>
          x.types.includes("postal_code")
        ).long_name,
      });
    };

    if (selection) {
      getAddressDetails();
    }
  }, [selection]);

  return (
    <div className="flex items-center justify-between border-b-2 px-6 py-12">
      <p className="mr-4 text-xl text-gray-400">Ship to Suburb</p>
      <Combobox value={selection} onChange={setSelection}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setValue("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {data.length === 0 && value !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                data.map(({ place_id, description }) => (
                  <Combobox.Option
                    key={place_id}
                    value={{ place_id, description }}
                    as={Fragment}
                  >
                    {({ active, selected }) => (
                      <li
                        className={`flex cursor-pointer p-2 ${
                          active
                            ? "bg-blue-500 text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {/* {selected && <TiTick />} */}
                        {description}
                      </li>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default ShippingAddressField;
