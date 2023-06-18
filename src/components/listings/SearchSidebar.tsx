import { Button } from "../../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useRouter } from "next/router";

const SearchSidebar = () => {
  const router = useRouter();

  const updateQuery = (key: string, value: string) => {
    const query = router.query;
    if (query[key] === value) {
      delete query[key];
      router.push({
        pathname: router.pathname,
        query: query,
      });
      return;
    }
    query[key] = value;
    router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  return (
    <div className="w-1/6">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Generation</AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Series</AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Model</AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Categories
          </h2>
          <div className="space-y-1">
            <Button
              onClick={() => updateQuery("category", "engine")}
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${
                router.query.category === "engine"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
            >
              Engine/Driveline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${
                router.query.category === "suspension"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => updateQuery("category", "suspension")}
            >
              Suspension & Brakes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${
                router.query.category === "interior"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => updateQuery("category", "interior")}
            >
              Interior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${
                router.query.category === "exterior"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => updateQuery("category", "exterior")}
            >
              Exterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${
                router.query.category === "electrical"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => updateQuery("category", "electrical")}
            >
              Electrical
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSidebar;
