import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const listingRouter = router({
  createListing: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        condition: z.string().min(3),
        price: z.number().min(1).max(1000000),
        parts: z.array(z.string()),
      })
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          condition: input.condition,
          price: input.price,
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
      })
    )
    .query(async ({ ctx, input }) => {
      if (
        !input.generation &&
        !input.model &&
        !input.series &&
        !input.category
      ) {
        const listings = await ctx.prisma.listing.findMany({
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
          where: {
            active: true,
            OR: [
              {
                description: {
                  contains: input.search || "",
                },
              },
              {
                title: {
                  contains: input.search || "",
                },
              },
              {
                parts: {
                  some: {
                    partDetails: {
                      partNo: {
                        contains: input.search || "",
                      },
                    },
                  },
                },
              },
            ],
          },
        });
        return listings;
      } else {
        const listings = await ctx.prisma.listing.findMany({
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
          where: {
            active: true,
            OR: [
              {
                description: {
                  contains: input.search || "",
                },
              },
              {
                title: {
                  contains: input.search || "",
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
                          contains: input.category || "",
                        },
                      },
                      name: {
                        contains: input.subcat || "",
                      },
                    },
                  },
                  cars: {
                    some: {
                      generation: {
                        contains: input.generation || "",
                      },
                      model: input.model,
                      series: input.series,
                    },
                  },
                },
              },
            },
          },
        });
        return listings;
      }
    }),
  //For use with inf query
  // getAllAvailable: publicProcedure
  //   .input(
  //     z.object({
  //       generation: z.string().optional(),
  //       model: z.string().optional(),
  //       series: z.string().optional(),
  //       search: z.string().optional(),
  //       category: z.string().optional(),
  //       subcat: z.string().optional(),
  //       cursor: z.any().nullish(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     if (
  //       !input.generation &&
  //       !input.model &&
  //       !input.series &&
  //       !input.category
  //     ) {
  //       const listings = await ctx.prisma.listing.findMany({
  //         include: {
  //           images: {
  //             orderBy: {
  //               order: "asc",
  //             },
  //           },
  //           // parts: true,
  //           parts: {
  //             include: {
  //               partDetails: {
  //                 include: {
  //                   partTypes: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         where: {
  //           active: true,
  //           OR: [
  //             {
  //               description: {
  //                 contains: input.search || "",
  //               },
  //             },
  //             {
  //               title: {
  //                 contains: input.search || "",
  //               },
  //             },
  //             {
  //               parts: {
  //                 some: {
  //                   partDetails: {
  //                     partNo: {
  //                       contains: input.search || "",
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //         cursor: input.cursor ? { id: input.cursor } : undefined,
  //         take: 20,
  //       });
  //       let nextCursor: typeof input.cursor | undefined = undefined;
  //       if (listings.length > 19) {
  //         const nextItem = listings.pop();
  //         nextCursor = nextItem?.id;
  //       }
  //       return { listings, nextCursor };
  //     } else {
  //       const listings = await ctx.prisma.listing.findMany({
  //         include: {
  //           images: {
  //             orderBy: {
  //               order: "asc",
  //             },
  //           },
  //           parts: {
  //             include: {
  //               partDetails: {
  //                 include: {
  //                   partTypes: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         where: {
  //           active: true,
  //           OR: [
  //             {
  //               description: {
  //                 contains: input.search || "",
  //               },
  //             },
  //             {
  //               title: {
  //                 contains: input.search || "",
  //               },
  //             },
  //           ],
  //           parts: {
  //             some: {
  //               partDetails: {
  //                 partTypes: {
  //                   some: {
  //                     parent: {
  //                       name: {
  //                         contains: input.category || "",
  //                       },
  //                     },
  //                     name: {
  //                       contains: input.subcat || "",
  //                     },
  //                   },
  //                 },
  //                 cars: {
  //                   some: {
  //                     generation: {
  //                       contains: input.generation || "",
  //                     },
  //                     model: input.model,
  //                     series: input.series,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         cursor: input.cursor ? { id: input.cursor } : undefined,
  //         take: 20,
  //       });
  //       let nextCursor: typeof input.cursor | undefined = undefined;
  //       if (listings.length > 19) {
  //         const nextItem = listings.pop();
  //         nextCursor = nextItem?.id;
  //       }
  //       return { listings, nextCursor };
  //     }
  //   }),
  getSearchBar: publicProcedure
    .input(
      z.object({
        search: z.string(),
      })
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
              },
            },
            {
              title: {
                contains: input.search || "",
              },
            },
          ],
          // parts: {
          //   some: {
          //     partDetails: {
          //       cars: {
          //         some: {
          //           generation: input.generation,
          //           model: input.model,
          //           series: input.series,
          //         },
          //       },
          //     },
          //   },
          // },
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
      })
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
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.listing.findUnique({
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
                  width: true,
                  height: true,
                  weight: true,
                  partNo: true,
                  cars: {
                    select: {
                      id: true,
                      generation: true,
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
    }),
  deleteListing: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
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
      })
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
});
