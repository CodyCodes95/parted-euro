import usePlacesAutocomplete, { getDetails, getZipCode } from "use-places-autocomplete";
import Select from "react-select";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

interface ShippingAddressFieldProps {
  setPostCode: (postCode: string) => void;
}

const ShippingAddressField: React.FC<ShippingAddressFieldProps> = ({setPostCode}) => {
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
      const postCode = results.address_components.find((x:any) => x.types.includes("postal_code")).long_name;
      setPostCode(postCode);
    };

    if (selection) {
      getAddressDetails();
    }
  }, [selection]);

  return (
    <div className="flex items-center justify-between border-b-2 px-6 py-12">
      <p className="text-xl text-gray-400 mr-4">Shipping</p>
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
