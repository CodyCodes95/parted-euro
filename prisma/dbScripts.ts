
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function migrate() {
//   const parentCategories = await prisma.partTypeParentCategory.findMany();

//   // Create a new PartType for each PartTypeParentCategory
//   for (const category of parentCategories) {
//     const newPartType = await prisma.partTypes.create({
//       data: {
//         id: category.id, // Use the same ID to keep references intact
//         name: category.name,
//         createdAt: category.createdAt,
//         updatedAt: category.updatedAt,
//       },
//     });

//     console.log(`Created new PartType: ${newPartType.name}`);
//   }

//   // Update all PartTypes to have the correct parentId
//   const partTypes = await prisma.partTypes.findMany();
//   for (const partType of partTypes) {
//     if (partType.parentId) {
//       await prisma.partTypes.update({
//         where: { id: partType.id },
//         data: { parentId: partType.parentId },
//       });
//       console.log(`Updated PartType: ${partType.name}`);
//     }
//   }

//   console.log("Migration completed");
// }

// migrate()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const main = () => {
  console.log("test");
};

