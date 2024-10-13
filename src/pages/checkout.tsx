import Link from "next/link";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Info, Trash, TriangleAlert } from "lucide-react";
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
  const { cart, setCart, removeItemFromCart } = useCartStore();
  // const [parent] = useAutoAnimate();

  const [address, setAddress] = useState<AddressType>({
    formattedAddress: "",
    city: "",
    region: "",
    postalCode: "",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [shipToCountryCode, setShipToCountryCode] = useState("AU");
  const [isB2B, setIsB2B] = useState(false);

  useEffect(() => {
    localStorage.setItem("checkout-address", JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    localStorage.setItem("checkout-name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("checkout-email", email);
  }, [email]);

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
        });
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
          <Button
            type="reset"
            onClick={() => {
              setSelectedPlaceId("");
              setAddress({
                formattedAddress: "",
                city: "",
                region: "",
                postalCode: "",
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
      types: ["(regions)"],
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
