import usePlacesAutocomplete, { getDetails, getZipCode } from "use-places-autocomplete";
import Select from "react-select";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postCode: string;
}

interface ShippingAddressFieldProps {
  setShippingAddress: (address: ShippingAddress) => void;
}

const ShippingAddressField: React.FC<ShippingAddressFieldProps> = ({ setShippingAddress}) => {
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
      types: ["address"],
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
      const results:any = await getDetails({
        placeId: selection?.place_id,
        fields: ["address_components"],
      });
       setShippingAddress({
         line1: `${
           results.address_components.find((x: any) =>
             x.types.includes("street_number")
           ).long_name
         } ${
           results.address_components.find((x: any) =>
             x.types.includes("route")
           ).long_name
         }`,
         line2:
           results.address_components.find((x: any) =>
             x.types.includes("subpremise")
           )?.long_name || "",
         city: results.address_components.find((x: any) =>
           x.types.includes("locality")
         ).long_name,
         state: results.address_components.find((x: any) =>
           x.types.includes("administrative_area_level_1")
         ).long_name,
         country: results.address_components.find((x: any) =>
           x.types.includes("country")
         ).long_name,
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
      <p className="text-xl text-gray-400 mr-4">Shipping Address</p>
      <Autocomplete
        sx={{ width: 500 }}
        loading={data.length < 1 && value !== ""}
        filterOptions={(x) => x}
        options={options}
        value={selection}
        onInputChange={(event, newInputValue) => {
          setValue(newInputValue);
        }}
        noOptionsText={value !== "" ? "Address not found" : "Enter a location"}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.description
        }
        onChange={(event: any, newValue: PlaceType | null) => {
          setOptions(newValue ? [newValue, ...options] : options);
          setSelection(newValue as PlaceType);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Enter Your Address" fullWidth />
        )}
      />
    </div>
  );
};

export default ShippingAddressField;
