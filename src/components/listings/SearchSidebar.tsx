import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";



const SearchSidebar = () => {

  const [client, setClient] = useState(false);

  useEffect(() => {
    if (window) {
      setClient(true);
    }
  }, []);

  if (!client) return null
  
  return (
    <div className="w-1/6">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Generation</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Series</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that matches the other
                components aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Model</AccordionTrigger>
              <AccordionContent>
                Yes. Its animated by default, but you can disable it if you
                prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Categories
          </h2>
          <div className="space-y-1">
            {/* <Button variant="ghost" size="sm" className={`w-full justify-start`}>
              <ListMusic className="mr-2 h-4 w-4" />
              Playlists
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Music2 className="mr-2 h-4 w-4" />
              Songs
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Made for You
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Mic2 className="mr-2 h-4 w-4" />
              Artists
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Library className="mr-2 h-4 w-4" />
              Albums
            </Button> */}
            <Button variant="ghost" size="sm" className={`w-full justify-start ${window.location.search.includes("engine") ? "bg-accent text-accent-foreground" : ""}`}>
              Engine/Driveline
            </Button>
            <Button variant="ghost" size="sm" className={`w-full justify-start ${window.location.search.includes("suspension") ? "bg-accent text-accent-foreground" : ""}`}>
              Suspension & Brakes
            </Button>
            <Button variant="ghost" size="sm" className={`w-full justify-start ${window.location.search.includes("interior") ? "bg-accent text-accent-foreground" : ""}`}>
              Interior
            </Button>
            <Button variant="ghost" size="sm" className={`w-full justify-start ${window.location.search.includes("exterior") ? "bg-accent text-accent-foreground" : ""}`}>
              Exterior
            </Button>
            <Button variant="ghost" size="sm" className={`w-full justify-start ${window.location.search.includes("electrical") ? "bg-accent text-accent-foreground" : ""}`}>
              Electrical
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchSidebar;