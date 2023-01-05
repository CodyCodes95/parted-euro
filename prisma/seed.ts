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
                generation: "E39",
                model: "535i",
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
                generation: "F80",
                model: "M3",
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
    const firstCar = await prisma.car.findFirst()
    const fiveSeries = await prisma.car.findFirst({
        where: {
            model: "535i"
        }
    })
    const m3 = await prisma.car.findFirst({
        where: {
            generation: "F80"
        }
    })
    const m4 = await prisma.car.findFirst({
        where: {
            generation: "F82"
        }
    })

    const origins = await prisma.origin.createMany({
      data: [
        {
          vin: "WBSBL92060JR08716",
          year: 2003,
          cost: 2300000,
          mileage: 141000,
          carId: firstCar.id,
        },
        {
          vin: "WBADN22000GE68930",
          year: 1999,
          cost: 1500000,
          mileage: 220000,
          carId: fiveSeries.id,
        },
        {
          vin: "WBS3R922090K345058",
          year: 2016,
          cost: 300000,
          mileage: 24000,
          carId: m4.id,
        },
        {
          vin: "WBS8M920105G47739",
          year: 2015,
          cost: 40000,
          mileage: 21000,
          carId: m3.id,
        },
      ],
    });

    // const parts = await prisma.part.createMany({
    //     data: [
    //         {

    //         }
    //     ]
    // })
    console.log(cars, origins)
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
