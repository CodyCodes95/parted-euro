import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const cars = await prisma.car.createMany({
        data: [
            {
                make: "BMW",
                series: "3 Series",
                generation: "E46",
                model: "M3",
                body: "Coupe"
            },
            {
                make: "BMW",
                series: "3 Series",
                generation: "E46",
                model: "M3",
                body: "Convertible"
            },
            {
                make: "BMW",
                series: "3 Series",
                generation: "E36",
                model: "M3",
            },
            {
                make: "BMW",
                series: "5 Series",
                generation: "E39",
                model: "M5",
            },
            {
                make: "BMW",
                series: "5 Series",
                generation: "E60",
                model: "M5",
            },
            {
                make: "BMW",
                series: "7 Series",
                generation: "E38",
                model: "728i",
            },
            {
                make: "BMW",
                series: "8 Series",
                generation: "E31",
                model: "840Ci",
            },
            {
                make: "BMW",
                series: "5 Series",
                generation: "E34",
                model: "525i",
            },
            {
                make: "BMW",
                series: "X Series",
                generation: "E53",
                model: "X5",
            },
            {
                make: "BMW",
                series: "F Series",
                generation: "F30",
                model: "328i",
            },
            {
                make: "BMW",
                series: "F Series",
                generation: "F82",
                model: "M4",
            },
            {
                make: "BMW",
                series: "F Series",
                generation: "F83",
                model: "M4",
            },
        ]
    })
    console.log({cars})
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
