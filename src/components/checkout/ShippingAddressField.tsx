import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import Select from "react-select";
import { useEffect } from "react";

const ShippingAddressField: React.FC = () => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["(address)"],
      componentRestrictions: {
        country: "AU",
      },
    },
    debounce: 300,
  });

  const handleSelect = async () => {
    //   setValue(address, false);
    //   clearSuggestions();
    //   const results = await getDetails({ placeId: id });
  };

  return (
    <div className="flex items-center justify-between border-b-2 px-6 py-12">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        onClick={() => {
          fetch(`/api/checkout/shipping`, {
            method: "POST",
            body: {
              length: 10,
              width: 10,
              height: 10,
              weight: 10,
              from: "2000",
              to: "3000",
            } as any,
          })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error(error));
        }}
      >
        Get Price
      </button>
    </div>
  );
};

export default ShippingAddressField;
