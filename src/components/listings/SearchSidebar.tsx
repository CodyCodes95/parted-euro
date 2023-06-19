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

  const updateCategory = (key: string, value: string) => {
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
  }

  const parameterExists = (key: string, value: string) => {
    if (Array.isArray(router.query[key])) {
      return router.query[key]?.includes(value);
    }
    return router.query[key] === value;
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
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuery("series", series)}
                    className={`flex w-full justify-between hover:bg-accent hover:text-accent-foreground`}
                  >
                    <p>{series}</p>
                    <input
                      checked={parameterExists("series", series)}
                      type="checkbox"
                      className="h-4 w-4"
                    />
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
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuery("generation", generation)}
                    className="flex w-full justify-between 
                      hover:bg-accent hover:text-accent-foreground
                    "
                  >
                    <p>{generation}</p>
                    <input
                      type="checkbox"
                      checked={parameterExists("generation", generation)}
                      className="h-4 w-4"
                    />
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
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuery("model", model)}
                    className="flex w-full justify-between 
                      hover:bg-accent hover:text-accent-foreground
                    "
                  >
                    <p>{model}</p>
                    <input
                      checked={parameterExists("model", model)}
                      type="checkbox"
                      className="h-4 w-4"
                    />
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
              onClick={() => updateCategory("category", "engine")}
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
              onClick={() => updateCategory("category", "suspension")}
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
              onClick={() => updateCategory("category", "interior")}
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
              onClick={() => updateCategory("category", "exterior")}
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
              onClick={() => updateCategory("category", "electrical")}
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
