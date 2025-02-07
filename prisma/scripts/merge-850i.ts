import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function mergeCars() {
  console.log("Starting car merge process...");

  // Find both cars
  const [car850i, car850Ci] = await Promise.all([
    prisma.car.findFirst({
      where: { model: "850i" },
      include: {
        parts: true,
        Donor: true,
      },
    }),
    prisma.car.findFirst({
      where: { model: "850Ci" },
      include: {
        parts: true,
        Donor: true,
      },
    }),
  ]);

  if (!car850i || !car850Ci) {
    console.error("Could not find one or both car models!");
    return;
  }

  console.log(`Found 850i (${car850i.id}) and 850Ci (${car850Ci.id})`);

  // Get all part details for 850Ci to check for duplicates
  const car850CiPartDetails = await prisma.partDetail.findMany({
    where: {
      cars: {
        some: {
          id: car850Ci.id,
        },
      },
    },
    select: {
      partNo: true,
    },
  });

  const car850CiPartNos = new Set(car850CiPartDetails.map((pd) => pd.partNo));

  // Begin transaction to ensure data consistency
  await prisma.$transaction([
    // 1. Update all donors to point to 850Ci
    prisma.donor.updateMany({
      where: { carId: car850i.id },
      data: { carId: car850Ci.id },
    }),

    // 2. Connect part details to 850Ci that aren't already connected
    ...car850i.parts
      .filter((pd) => !car850CiPartNos.has(pd.partNo))
      .map((pd) =>
        prisma.partDetail.update({
          where: { partNo: pd.partNo },
          data: {
            cars: {
              connect: { id: car850Ci.id },
            },
          },
        }),
      ),

    // 3. Disconnect all part details from 850i
    ...car850i.parts.map((pd) =>
      prisma.partDetail.update({
        where: { partNo: pd.partNo },
        data: {
          cars: {
            disconnect: { id: car850i.id },
          },
        },
      }),
    ),

    // 4. Finally delete the 850i car
    prisma.car.delete({
      where: { id: car850i.id },
    }),
  ]);

  console.log("Car merge completed successfully!");
}

// Execute the merge
mergeCars()
  .catch((e) => {
    console.error("Error during merge:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
