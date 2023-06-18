import { Button } from "../../components/ui/button";
import { trpc } from "../../utils/trpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useRouter } from "next/router";

const SearchSidebar = () => {
  const router = useRouter();

  const cars = trpc.cars.getAllData.useQuery();

  const updateQuery = (key: string, value: string) => {
    const query = router.query;
    delete query.subcat;
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
    <div className="w-1/5">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Series</AccordionTrigger>
              <AccordionContent>
                {cars.data?.series.map((series) => (
                  <Button
                    key={series}
                    onClick={() => updateQuery("category", "engine")}
                    variant="ghost"
                    size="sm"
                    className={`flex w-full justify-between ${
                      router.query.category === "engine"
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <p>{series}</p>
                    <input type="checkbox" className="h-4 w-4" />
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Generation</AccordionTrigger>
              <AccordionContent>
                {cars.data?.generations.map((generation) => (
                  <Button
                    key={generation}
                    onClick={() => updateQuery("category", "engine")}
                    variant="ghost"
                    size="sm"
                    className={`flex w-full justify-between ${
                      router.query.category === "engine"
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <p>{generation}</p>
                    <input type="checkbox" className="h-4 w-4" />
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Model</AccordionTrigger>
              <AccordionContent>
                {cars.data?.models.map((model) => (
                  <Button
                    key={model}
                    onClick={() => updateQuery("category", "engine")}
                    variant="ghost"
                    size="sm"
                    className={`flex w-full justify-between ${
                      router.query.category === "engine"
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <p>{model}</p>
                    <input type="checkbox" className="h-4 w-4" />
                  </Button>
                ))}
              </AccordionContent>
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
