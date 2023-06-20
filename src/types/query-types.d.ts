import type {
  Listing,
  Part,
  Image,
  PartTypes,
  PartDetail,
  Car,
} from "@prisma/client";

type ListingsSearchQuery = (Listing & {
  parts: (Part & {
    partDetails: PartDetail & {
      partTypes: PartTypes[];
      cars: Car[];
    };
  })[];
  images: Image[];
})[] | undefined
