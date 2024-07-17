import { useEffect, useState } from "react";

export const useGoogleMapsApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const mountGoolgleMapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    mountGoolgleMapsScript();
    // @ts-expect-error: Setting our own function on window
    window.initMap = () => {
      setIsLoaded(true);
    };
  }, []);

  return { isLoaded };
};
