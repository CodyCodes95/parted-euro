import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";

export const listingRouter = router({
  createListing: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        condition: z.string().min(3),
        price: z.number().min(1).max(1000000),
        parts: z.array(z.string()),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listing.create({
        data: {
          title: input.title,
          description: input.description,
          condition: input.condition,
          price: input.price,
          parts: {
            connect: input.parts.map((part) => {
              return { id: part };
            }),
          },
        },
      });
    }),
  updateListing: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3),
        description: z.string().min(5),
        condition: z.string().min(3),
        price: z.number().min(1).max(1000000),
        parts: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentListing = await ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        include: {
          parts: true,
        },
      });
      const partsToDisconnect = currentListing?.parts.filter(
        (part) => !input.parts.includes(part.partDetailsId),
      );
      const listing = await ctx.prisma.listing.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          condition: input.condition,
          price: input.price,
          parts: {
            connect: input.parts.map((part) => {
              return { id: part };
            }),
            disconnect: partsToDisconnect?.map((part) => {
              return { id: part.id };
            }),
          },
        },
      });
      return listing;
    }),
  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    const listings = await ctx.prisma.listing.findMany({
      include: {
        parts: {
          include: {
            partDetails: {
              include: {
                cars: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return listings;
  }),

  getAllAvailable: publicProcedure
    .input(
      z.object({
        generation: z.string().optional(),
        model: z.string().optional(),
        series: z.string().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
        subcat: z.string().optional(),
        page: z.number(),
        sortBy: z.string(),
        sortOrder: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orderBy: Record<string, "asc" | "desc"> = {};
      orderBy[input.sortBy] = input.sortOrder as "asc" | "desc";
      if (
        !input.generation &&
        !input.model &&
        !input.series &&
        !input.category
      ) {
        const queryWhere = {
          active: true,
          OR: [
            // {
            //   description: {
            //     contains: input.search || "",
            //     mode: "insensitive",
            //   },
            // },
            {
              title: {
                contains: input.search ?? "",
                mode: "insensitive",
              },
            },
            {
              parts: {
                some: {
                  partDetails: {
                    partNo: {
                      contains: input.search ?? "",
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            {
              parts: {
                some: {
                  partDetails: {
                    alternatePartNumbers: {
                      contains: input.search ?? "",
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        } as Prisma.ListingWhereInput;
        const listings = await ctx.prisma.listing.findMany({
          take: 20,
          skip: input.page * 20,
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
            // parts: true,
            parts: {
              include: {
                partDetails: {
                  include: {
                    partTypes: true,
                    cars: true,
                  },
                },
              },
            },
          },
          where: queryWhere,
          orderBy,
        });
        const count = await ctx.prisma.listing.count({ where: queryWhere });
        const hasNextPage = count > input.page * 20 + 20;
        const totalPages = Math.ceil(count / 20);
        return { listings, count, hasNextPage, totalPages };
      } else {
        const queryWhere = {
          active: true,
          OR: [
            // {
            //   description: {
            //     contains: input.search || "",
            //     mode: "insensitive",
            //   },
            // },
            {
              title: {
                contains: input.search ?? "",
                mode: "insensitive",
              },
            },
          ],
          parts: {
            some: {
              partDetails: {
                partTypes: {
                  some: {
                    parent: {
                      name: {
                        contains: input.category ?? "",
                      },
                    },
                    name: {
                      contains: input.subcat ?? "",
                    },
                  },
                },
                cars: {
                  some: {
                    generation: {
                      contains: input.generation ?? "",
                    },
                    model: input.model,
                    series: input.series,
                  },
                },
              },
            },
          },
        } as Prisma.ListingWhereInput;
        const listings = await ctx.prisma.listing.findMany({
          take: 20,
          skip: input.page * 20,
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
            parts: {
              include: {
                partDetails: {
                  include: {
                    partTypes: true,
                    cars: true,
                  },
                },
              },
            },
          },
          where: queryWhere,
          orderBy,
        });
        const count = await ctx.prisma.listing.count({ where: queryWhere });
        const hasNextPage = count > input.page * 20 + 20;
        const totalPages = Math.ceil(count / 20);
        return { listings, count, hasNextPage, totalPages };
      }
    }),
  getSearchBar: publicProcedure
    .input(
      z.object({
        search: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        take: 5,
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          parts: true,
        },
        where: {
          active: true,
          OR: [
            {
              description: {
                contains: input.search || "",
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: input.search || "",
                mode: "insensitive",
              },
            },
          ],
        },
      });
      return listings;
    }),
  getRelatedListings: publicProcedure
    .input(
      z.object({
        generation: z.string(),
        model: z.string(),
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        take: 4,
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          parts: true,
        },
        where: {
          id: {
            not: input.id,
          },
          active: true,
          parts: {
            some: {
              partDetails: {
                cars: {
                  some: {
                    generation: input.generation,
                    model: input.model,
                  },
                },
              },
            },
          },
        },
      });
      if (listings.length === 0) {
        const listings = await ctx.prisma.listing.findMany({
          take: 4,
          include: {
            images: true,
            parts: true,
          },
          where: {
            id: {
              not: input.id,
            },
            active: true,
          },
        });
        return listings;
      } else {
        return listings;
      }
    }),
  getListing: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      const listing = ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          condition: true,
          price: true,
          images: {
            orderBy: {
              order: "asc",
            },
          },
          parts: {
            where: {
              quantity: {
                gt: 0,
              },
            },
            select: {
              donor: {
                select: {
                  vin: true,
                  year: true,
                  car: true,
                  mileage: true,
                },
              },
              partDetails: {
                select: {
                  length: true,
                  name: true,
                  width: true,
                  height: true,
                  weight: true,
                  partNo: true,
                  alternatePartNumbers: true,
                  cars: {
                    select: {
                      id: true,
                      generation: true,
                      series: true,
                      model: true,
                      body: true,
                    },
                  },
                },
              },
              quantity: true,
            },
          },
        },
      });
      if (!listing.parts.length) return null;
      return listing;
    }),
  deleteListing: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.listing.delete({
        where: {
          id: input.id,
        },
      });
    }),
  markAsNotListedEbay: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.listing.update({
        where: {
          id: input.id,
        },
        data: {
          listedOnEbay: false,
        },
      });
    }),
  getAllCarsOnListing: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        include: {
          parts: {
            include: {
              partDetails: {
                include: {
                  cars: true,
                },
              },
            },
          },
        },
      });
      return listing?.parts
        .map((part) =>
          part.partDetails.cars
            .filter((car) =>
              listing.parts.every((part) =>
                part.partDetails.cars.some((car2) => car2.id === car.id),
              ),
            )
            .map((car) => ({
              make: car.make,
              series: car.series,
              model: car.model,
              body: car.body,
              id: car.id,
            })),
        )
        .flat();
    }),
});
