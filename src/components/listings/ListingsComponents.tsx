import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { Button } from "../ui/button";

export const CategoryFilters = () => {
  const router = useRouter();
  const { category } = router.query;
  const categories = trpc.categories.getParentCategories.useQuery();
  const subCategories = trpc.categories.getSubCategoriesByParent.useQuery(
    {
      parentCategoryId: category as string,
    },
    {
      enabled: !!category,
    },
  );

  const updateCategory = (key: string, value: string) => {
    const query = router.query;
    if (query[key] === value && key === "subcat") {
      delete query.subcat;
      return router.push({
        pathname: router.pathname,
        query: query,
      });
    }
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
    <div className="flex flex-col gap-2">
      <h2 className="p-2 text-2xl">Categories</h2>
      <div className="flex-1 overflow-clip py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {categories.data?.map((category) => (
            <div key={category.id}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  router.query.category === category.name
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => updateCategory("category", category.name)}
              >
                {category.name}
              </Button>
              {category.name === router.query.category && subCategories && (
                <div className="ml-4">
                  {subCategories.data?.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        router.query.subcat === subCategory.name
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => updateCategory("subcat", subCategory.name)}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export const CarSelection = () => {
  const router = useRouter();
  const { series, generation } = router.query;

  const cars = trpc.cars.getAllSeries.useQuery();

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series } as { series: string },
    {
      enabled: !!series,
    },
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation } as { series: string; generation: string },
    {
      enabled: !!generation,
    },
  );

  if (!series) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xl">Select your series</p>
        <div className="flex flex-wrap gap-2">
          {cars.data?.series.map((series) => (
            <Button
              variant={"outline"}
              className="border p-2"
              key={series.value}
              onClick={() => {
                router.query.series = series.value;
                router.push(router);
              }}
            >
              {series.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xl">Select generation</p>
        <div className="flex flex-wrap gap-2">
          {generations.data?.generations.map((generation) => (
            <Button
              variant={"outline"}
              className="border p-2"
              key={generation.value}
              onClick={() => {
                router.query.generation = generation.value;
                router.push(router);
              }}
            >
              {generation.label.split("(")[0]}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl">Select model</p>
      <div className="flex flex-wrap gap-2">
        {models.data?.models.map((model) => (
          <Button
            variant={"outline"}
            className="border p-2"
            key={model.value}
            onClick={() => {
              router.query.model = model.value;
              router.push(router);
            }}
          >
            {model.label}
          </Button>
        ))}
      </div>
    </div>
  );
};