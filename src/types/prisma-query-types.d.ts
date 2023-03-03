import type { Car, Part, PartDetail, PartTypes } from "@prisma/client";

type PartDetailWithRelations = PartDetail & {
  partTypes: PartTypes[];
  parts: Part[];
  cars: Car[];
};
