import Link from "next/link";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Info, PencilIcon, Trash, TriangleAlert } from "lucide-react";
import type { CartItem } from "../context/cartContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatter } from "../utils/formatPrice";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { trpc } from "../utils/trpc";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "../components/ui/command";
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { FormMessages } from "../components/ui/FormMessages";
import { Delete, Loader2 } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { useCartStore } from "../context/cartStore";
import { useGoogleMapsApi } from "../hooks/useGoogleMapsApi";

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return <Checkout />;
}

export function Checkout() {
  const { cart, setCart, removeItemFromCart } = useCartStore();
  // const [parent] = useAutoAnimate();

  const [address, setAddress] = useState<AddressType>(
    localStorage.getItem("checkout-address")
      ? (JSON.parse(localStorage.getItem("checkout-address")!) as AddressType)
      : {
          formattedAddress: "",
          city: "",
          region: "",
          postalCode: "",
          address1: "",
          address2: "",
        },
  );
  const [name, setName] = useState(localStorage.getItem("checkout-name") ?? "");
  const [email, setEmail] = useState(
    localStorage.getItem("checkout-email") ?? "",
  );
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [shipToCountryCode, setShipToCountryCode] = useState("AU");
  const [isB2B, setIsB2B] = useState(false);

  const cartWeight = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.weight * item.quantity, 0);
  }, [cart]);

  const pickupOnly = cartWeight > 35;

  const largestCartItem = useMemo(() => {
    return cart.reduce(
      (prev, current) =>
        prev.length * prev.width * prev.height >
        current.length * current.width * current.height
          ? prev
          : current,
      {} as CartItem,
    );
  }, [cart]);

  const ausPostShippingCountries =
    trpc.checkout.getShippingCountries.useQuery();

  const shippingServices = trpc.checkout.getShippingServices.useQuery(
    {
      destinationPostcode: address.postalCode ?? "",
      weight: cartWeight,
      length: largestCartItem.length,
      width: largestCartItem.width,
      height: largestCartItem.height,
      destinationCountry: shipToCountryCode || "AUSTRALIA",
      destinationCity: address.city ?? "",
      destinationState: address.region ?? "",
      b2b: isB2B,
    },
    {
      enabled:
        !!cart.length &&
        (!!address.postalCode || shipToCountryCode !== "AU" || pickupOnly),
      retry: false,
    },
  );

  const submitCheckout = async () => {
    if (!validated) return toast.error("Please fill out all fields");

    const items = cart.map((item) => ({
      itemId: item.listingId,
      quantity: item.quantity,
    }));

    const params = new URLSearchParams({
      items: JSON.stringify(items),
      name,
      email,
      countryCode: shipToCountryCode,
      shippingOptions: JSON.stringify(shippingServices.data),
    });

    if (shipToCountryCode === "AU") {
      params.append("address", JSON.stringify(address));
    }

    try {
      const res = await fetch(`/api/checkout?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const response = (await res.json()) as { url: string };
      window.location.href = response.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout. Please try again.");
    }
  };

  const validated = useMemo(() => {
    return shippingServices.data && name && email && acceptTerms;
  }, [shippingServices.data, name, email, acceptTerms]);

  return (
    <div className="bg-white p-8 md:px-40">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 md:px-6">
        <section className="flex flex-col gap-4 border-b py-6 md:gap-8">
          <div className="grid gap-2 text-sm">
            <h1 className="text-xl font-semibold md:text-2xl">Your Cart</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your cart contains {cart.length} items
            </p>
          </div>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.listingId}
                className="flex items-center justify-between "
              >
                <div className="flex items-center space-x-4">
                  <img
                    alt="Product Image"
                    className="h-10 w-10"
                    height="40"
                    src={item.listingImage}
                    style={{
                      aspectRatio: "40/40",
                      objectFit: "cover",
                    }}
                    width="40"
                  />
                  <Link
                    href={`/listings/listing?id=${item.listingId}`}
                    className="text-lg text-blue-500 hover:underline"
                  >
                    {item.listingTitle}
                  </Link>
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="flex items-center gap-2">
                    <p>Qty:</p>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        e.preventDefault();
                        const itemIndex = cart.findIndex(
                          (item) => item.listingId === item.listingId,
                        );
                        if (itemIndex === -1) return;
                        const updatedCart = [...cart];
                        updatedCart[itemIndex]!.quantity = Number(
                          e.target.value,
                        );
                        setCart(updatedCart);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <p className="flex items-center gap-2">
                      Price:
                      <span className="font-bold">
                        {formatter.format(item.listingPrice)}
                      </span>
                    </p>
                    <Trash
                      onClick={(e) => {
                        e.preventDefault();
                        removeItemFromCart(item.listingId);
                      }}
                      className="h-4 w-4 cursor-pointer text-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="py-4">
            <div className="grid w-3/4 grid-cols-2 md:w-1/2">
              <h3 className="font-semibold">Shipping:</h3>
              <p>Calculated at checkout</p>
            </div>
            <div className="grid w-3/4 grid-cols-2 md:w-1/2">
              <h3 className="font-semibold">Total inc. GST:</h3>
              <p>
                {cart
                  ?.reduce(
                    (acc: number, item) =>
                      acc + item.listingPrice * item.quantity,
                    0,
                  )
                  .toLocaleString("en-au", {
                    style: "currency",
                    currency: "AUD",
                  })}
              </p>
            </div>
          </div>
        </section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitCheckout();
          }}
        >
          <section className="grid gap-4 py-6">
            <h2 className="text-lg font-semibold md:text-xl">
              Shipping information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-sm" htmlFor="name">
                  Full name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="name"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="address"
                  placeholder="Enter your email address"
                />
              </div>
              {!pickupOnly && (
                <>
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Country</Label>
                    <Select
                      value={shipToCountryCode}
                      onValueChange={(value) => setShipToCountryCode(value)}
                    >
                      <SelectTrigger id="country" className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AU">Australia</SelectItem>
                        {ausPostShippingCountries.data?.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {shipToCountryCode === "AU" && (
                    <div className="grid gap-1.5">
                      <Label className="text-sm" htmlFor="zip">
                        Shipping suburb
                      </Label>
                      <AddressAutoComplete
                        address={address}
                        setAddress={setAddress}
                      />
                    </div>
                  )}
                </>
              )}
              <div className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-sm" htmlFor="zip">
                    B2B Delivery
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      checked={isB2B}
                      className="h-4 w-4"
                      type="checkbox"
                      onChange={(e) => setIsB2B(e.target.checked)}
                    />
                    <span>This is a business address</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-1.5">
                  <Label className="text-sm" htmlFor="zip">
                    Terms and conditions
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      className="h-4 w-4"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <span>
                      I have read & agree to the{" "}
                      <Link
                        target="_blank"
                        className="text-blue-500 hover:underline"
                        href="/returns-refunds"
                      >
                        Terms and Conditions
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {shippingServices.isError && (
              <Alert variant={"destructive"} className="w-full">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Shipping not available</AlertTitle>
                <AlertDescription>
                  {shippingServices.error.message}
                </AlertDescription>
              </Alert>
            )}
            {pickupOnly && (
              <Alert className="w-full">
                <Info className="h-4 w-4" />
                <AlertTitle>Pickup only</AlertTitle>
                <AlertDescription>
                  This item must be picked up from our warehouse in Knoxfield.
                </AlertDescription>
              </Alert>
            )}
          </section>
          <section className="flex flex-col gap-4 py-6">
            <div className="grid gap-4"></div>
            <Button type="submit" disabled={validated ? false : true}>
              Pay & Review
            </Button>
          </section>
        </form>
      </main>
    </div>
  );
}

export interface AddressType {
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  address1: string;
  address2: string;
}

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  showInlineError?: boolean;
  placeholder?: string;
}

export function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const { address, setAddress, showInlineError = true, placeholder } = props;
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const getPlaceDetails = async (placeId: string) => {
    const placeDetails = (await getDetails({
      placeId: placeId,
      fields: ["address_components", "formatted_address"],
    })) as google.maps.places.PlaceResult;
    return placeDetails;
  };

  const { isLoaded } = useGoogleMapsApi();

  useEffect(() => {
    if (selectedPlaceId) {
      void getPlaceDetails(selectedPlaceId).then((placeDetails) => {
        const city = placeDetails.address_components?.find((x) =>
          x.types.includes("locality"),
        )?.short_name;
        const addressOne = `${placeDetails.address_components?.find((x) =>
          x.types.includes("street_number"),
        )?.short_name} ${placeDetails.address_components?.find((x) =>
          x.types.includes("route"),
        )?.short_name}`;
        const postalCode = placeDetails.address_components?.find((x) =>
          x.types.includes("postal_code"),
        )?.short_name;
        const region = placeDetails.address_components?.find((x) =>
          x.types.includes("administrative_area_level_1"),
        )?.short_name;
        const formattedAddress = placeDetails.formatted_address;
        if (!city || !postalCode || !region || !formattedAddress) {
          return toast.error("Unable to find address from selected location");
        }
        setAddress({
          city: city,
          formattedAddress: formattedAddress,
          postalCode: postalCode,
          region: region,
          address1: addressOne,
          address2: "",
        });
        setIsOpen(true);
      });
    }
  }, [selectedPlaceId]);

  if (!isLoaded) return null;

  return (
    <>
      {selectedPlaceId !== "" || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input
            autoComplete="off"
            value={address?.formattedAddress}
            readOnly
          />
          <AddressDialog
            dialogTitle={"Edit Address"}
            address={address}
            setAddress={setAddress}
            open={isOpen}
            setOpen={setIsOpen}
          >
            <Button size="icon" variant="outline" className="shrink-0">
              <PencilIcon className="size-4" />
            </Button>
          </AddressDialog>
          <Button
            type="reset"
            onClick={() => {
              setSelectedPlaceId("");
              setAddress({
                formattedAddress: "",
                city: "",
                region: "",
                postalCode: "",
                address1: "",
                address2: "",
              });
            }}
            size="icon"
            variant="outline"
            className="shrink-0"
          >
            <Delete className="size-4" />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          showInlineError={showInlineError}
          placeholder={placeholder}
        />
      )}
    </>
  );
}

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  showInlineError?: boolean;
  placeholder?: string;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const { setSelectedPlaceId, selectedPlaceId, showInlineError, placeholder } =
    props;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const {
    value,
    setValue,
    suggestions: { data: predictions, loading },
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["address"],
      componentRestrictions: {
        country: "AU",
      },
    },
    debounce: 300,
  });

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div className="flex w-full items-center justify-between rounded-lg border bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <CommandPrimitive.Input
          autoComplete="false"
          value={value}
          onValueChange={setValue}
          onBlur={close}
          onFocus={open}
          placeholder={placeholder ?? "Enter suburb or postcode"}
          className="w-full rounded-lg p-3 outline-none"
        />
      </div>
      {value !== "" && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          type="error"
          className="pt-1 text-sm"
          messages={["Select a valid address from the list"]}
        />
      )}

      {isOpen && (
        <div className="relative h-auto animate-in fade-in-0 zoom-in-95">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative z-50 h-auto min-w-[8rem] overflow-hidden rounded-md border bg-background shadow-md">
                {loading ? (
                  <div className="flex h-28 items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {predictions
                      .filter(
                        (prediction) =>
                          !prediction.types.includes("colloquial_area"),
                      )
                      .map((prediction) => (
                        <CommandPrimitive.Item
                          value={prediction.place_id}
                          onSelect={() => {
                            setValue("");
                            setSelectedPlaceId(prediction.place_id);
                          }}
                          className="flex h-max cursor-pointer select-text flex-col items-start gap-0.5 rounded-md p-2 px-3 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                          key={prediction.place_id}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {prediction.description}
                        </CommandPrimitive.Item>
                      ))}
                  </>
                )}

                <CommandEmpty>
                  {!loading && predictions.length === 0 && (
                    <div className="flex items-center justify-center py-4">
                      {value === ""
                        ? "Please enter an address"
                        : "No address found"}
                    </div>
                  )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type React from "react";
import { type FormEvent } from "react";
import { type ZodError, z } from "zod";

interface AddressDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  dialogTitle: string;
}

interface AddressFields {
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
}

/**
 * Create a Zod schema for validating address fields.
 * Note that, different address vary from place to place.
 * This Schema makes sure that the required fields are filled.
 */
export function createAddressSchema(address: AddressFields) {
  let schema = {};

  if (address.address1 !== "") {
    schema = {
      ...schema,
      address1: z.string().min(1, {
        message: "Address line 1 is required",
      }),
    };
  }

  schema = {
    ...schema,
    address2: z.string().optional(),
  };

  if (address.city !== "") {
    schema = {
      ...schema,
      city: z.string().min(1, {
        message: "City is required",
      }),
    };
  }

  if (address.region !== "") {
    schema = {
      ...schema,
      region: z.string().min(1, {
        message: "State is required",
      }),
    };
  }

  if (address.postalCode !== "") {
    schema = {
      ...schema,
      postalCode: z.string().min(1, {
        message: "Postal code is required",
      }),
    };
  }

  return z.object(schema);
}

export function AddressDialog(
  props: React.PropsWithChildren<AddressDialogProps>,
) {
  const { children, dialogTitle, open, setOpen, address, setAddress } = props;

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const addressSchema = createAddressSchema({
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
  });

  /**
   * Update and format the address string with the given components
   */
  function updateAndFormatAddress(
    addressString: string,
    addressComponents: {
      "street-address": string;
      address2: string;
      locality: string;
      region: string;
      "postal-code": string;
    },
  ) {
    let updatedAddressString = addressString;

    // Replace each class content with its corresponding value
    Object.entries(addressComponents).forEach(([key, value]) => {
      if (key !== "address2") {
        const regex = new RegExp(`(<span class="${key}">)[^<]*(</span>)`, "g");
        updatedAddressString = updatedAddressString.replace(
          regex,
          `$1${value}$2`,
        );
      }
    });

    // Remove all span tags
    updatedAddressString = updatedAddressString.replace(/<\/?span[^>]*>/g, "");

    // Add address2 just after address1 if provided
    if (addressComponents.address2) {
      const address1Regex = new RegExp(
        `${addressComponents["street-address"]}`,
      );
      updatedAddressString = updatedAddressString.replace(
        address1Regex,
        `${addressComponents["street-address"]}, ${addressComponents.address2}`,
      );
    }

    // Clean up any extra spaces or commas
    updatedAddressString = updatedAddressString
      .replace(/,\s*,/g, ",")
      .trim()
      .replace(/\s\s+/g, " ")
      .replace(/,\s*$/, "");

    return updatedAddressString;
  }

  /**
   * Handle form submission and save the address
   */
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    try {
      addressSchema.parse({
        address1,
        address2,
        city,
        region,
        postalCode,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errorMap = zodError.flatten().fieldErrors;

      setErrorMap({
        address1: errorMap.address1?.[0] ?? "",
        address2: errorMap.address2?.[0] ?? "",
        city: errorMap.city?.[0] ?? "",
        region: errorMap.region?.[0] ?? "",
        postalCode: errorMap.postalCode?.[0] ?? "",
      });

      return;
    }

    if (
      address2 !== address.address2 ||
      postalCode !== address.postalCode ||
      address1 !== address.address1 ||
      city !== address.city ||
      region !== address.region
    ) {
      const newFormattedAddress = updateAndFormatAddress(
        address.formattedAddress,
        {
          "street-address": address1,
          address2,
          locality: city,
          region,
          "postal-code": postalCode,
        },
      );

      setAddress({
        ...address,
        city,
        region,
        address2,
        address1,
        postalCode,
        formattedAddress: newFormattedAddress,
      });
    }
    setOpen(false);
  };

  useEffect(() => {
    setAddress1(address.address1);
    setAddress2(address.address2 || "");
    setPostalCode(address.postalCode);
    setCity(address.city);
    setRegion(address.region);

    if (!open) {
      setErrorMap({});
    }
  }, [address, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 py-7">
            <div className="space-y-0.5">
              <Label htmlFor="address1">Address line 1</Label>
              <Input
                value={address1}
                onChange={(e) => setAddress1(e.currentTarget.value)}
                disabled={address?.address1 === ""}
                id="address1"
                name="address1"
                placeholder="Address line 1"
              />
              {errorMap.address1 && (
                <FormMessages
                  type="error"
                  className="pt-1 text-sm"
                  messages={[errorMap.address1]}
                />
              )}
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="address2">
                Address line 2{" "}
                <span className="text-xs text-secondary-foreground">
                  (Optional)
                </span>
              </Label>
              <Input
                value={address2}
                onChange={(e) => setAddress2(e.currentTarget.value)}
                disabled={address?.address1 === ""}
                id="address2"
                name="address2"
                placeholder="Address line 2"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="city">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.currentTarget.value)}
                  disabled={address?.city === ""}
                  id="city"
                  name="city"
                  placeholder="City"
                />
                {errorMap.city && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.city]}
                  />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="region">State / Province / Region</Label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.currentTarget.value)}
                  disabled={address?.region === ""}
                  id="region"
                  name="region"
                  placeholder="Region"
                />
                {errorMap.region && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.region]}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.currentTarget.value)}
                  disabled={address?.postalCode === ""}
                  id="postalCode"
                  name="postalCode"
                  placeholder="Postal Code"
                />
                {errorMap.postalCode && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.postalCode]}
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="reset"
              onClick={() => setOpen(false)}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
