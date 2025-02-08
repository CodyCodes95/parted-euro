import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import type { ListingsSearchQuery } from "../../types/query-types";
import { trpc } from "../../utils/trpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useRouter } from "next/router";
import { Badge } from "../ui/badge";

type SearchSidebarProps = {
  listings: ListingsSearchQuery;
};

const SearchSidebar: FC<SearchSidebarProps> = ({ listings }) => {
  const [carsCount, setCarsCount] = useState<{
    series: { [key: string]: number };
    generation: { [key: string]: number };
    model: { [key: string]: number };
  }>();

  const router = useRouter();

  const cars = trpc.cars.getAllData.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listings) {
      setCarsCount(countCars(listings));
    }
  }, [listings]);

  const countCars = (listings: ListingsSearchQuery) => {
    const seriesMap = new Map<string, number>();
    const generationMap = new Map<string, number>();
    const modelMap = new Map<string, number>();

    listings?.forEach((listing) => {
      const seriesSet = new Set<string>();
      const generationSet = new Set<string>();
      const modelSet = new Set<string>();
      listing.parts.forEach((part) => {
        part.partDetails.cars.forEach((car) => {
          seriesSet.add(car.series);
          generationSet.add(car.generation);
          modelSet.add(car.model);
        });
      });
      seriesSet.forEach((series) => {
        seriesMap.set(series, (seriesMap.get(series) || 0) + 1);
      });
      generationSet.forEach((generation) => {
        generationMap.set(generation, (generationMap.get(generation) || 0) + 1);
      });
      modelSet.forEach((model) => {
        modelMap.set(model, (modelMap.get(model) || 0) + 1);
      });
    });

    const result = {
      series: Object.fromEntries(seriesMap),
      generation: Object.fromEntries(generationMap),
      model: Object.fromEntries(modelMap),
    };

    return result;
  };

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
  };

  const parameterExists = (key: string, value: string) => {
    if (Array.isArray(router.query[key])) {
      return router.query[key]?.includes(value);
    }
    return router.query[key] === value;
  };

  return (
    <div className="w-1/4">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Series</AccordionTrigger>
              <AccordionContent>
                {cars.data?.series.map((series) => (
                  <>
                    {carsCount?.series[series] ||
                    parameterExists("series", series) ? (
                      <Button
                        key={series}
                        variant="ghost"
                        size="sm"
                        onMouseDown={() => updateQuery("series", series)}
                        className={`flex w-full justify-between hover:bg-accent hover:text-accent-foreground`}
                      >
                        <p>{series}</p>
                        <div>
                          <Badge className="mr-2 text-xs">
                            {carsCount?.series[series] || 0}
                          </Badge>

                          <input
                            checked={parameterExists("series", series)}
                            type="checkbox"
                            className="h-4 w-4"
                          />
                        </div>
                      </Button>
                    ) : null}
                  </>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Generation</AccordionTrigger>
              <AccordionContent>
                {cars.data?.generations.map((generation) => (
                  <>
                    {carsCount?.generation[generation] ||
                    parameterExists("generation", generation) ? (
                      <Button
                        key={generation}
                        variant="ghost"
                        size="sm"
                        onMouseDown={() =>
                          updateQuery("generation", generation)
                        }
                        className="flex w-full justify-between 
                      hover:bg-accent hover:text-accent-foreground
                    "
                      >
                        <p>{generation}</p>
                        <div>
                          <Badge className="mr-2 text-xs">
                            {carsCount?.generation[generation] || 0}
                          </Badge>
                          <input
                            type="checkbox"
                            checked={parameterExists("generation", generation)}
                            className="h-4 w-4"
                          />
                        </div>
                      </Button>
                    ) : null}
                  </>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Model</AccordionTrigger>
              <AccordionContent>
                {cars.data?.models.map((model) => (
                  <>
                    {carsCount?.model[model] ||
                    parameterExists("model", model) ? (
                      <Button
                        key={model}
                        variant="ghost"
                        size="sm"
                        onMouseDown={() => updateQuery("model", model)}
                        className="flex w-full justify-between 
                      hover:bg-accent hover:text-accent-foreground
                    "
                      >
                        <p className="whitespace-nowrap">{model}</p>
                        <div>
                          <Badge className="mr-2 text-xs">
                            {carsCount?.model[model] || 0}
                          </Badge>
                          <input
                            checked={parameterExists("model", model)}
                            type="checkbox"
                            className="h-4 w-4"
                          />
                        </div>
                      </Button>
                    ) : null}
                  </>
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
              onMouseDown={() => updateCategory("category", "engine")}
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
              onMouseDown={() => updateCategory("category", "suspension")}
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
              onMouseDown={() => updateCategory("category", "interior")}
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
              onMouseDown={() => updateCategory("category", "exterior")}
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
              onMouseDown={() => updateCategory("category", "electrical")}
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
