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
        body: "Coupe",
      },
      {
        make: "BMW",
        series: "3 Series",
        generation: "E46",
        model: "M3",
        body: "Convertible",
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
    ],
  });
  const firstCar = await prisma.car.findFirst();
  const fiveSeries = await prisma.car.findFirst({
    where: {
      model: "535i",
    },
  });
  const m3 = await prisma.car.findFirst({
    where: {
      generation: "F80",
    },
  });
  const m4 = await prisma.car.findFirst({
    where: {
      generation: "F82",
    },
  });

  const donors = await prisma.donor.createMany({
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

  const parts = await prisma.part.createMany({
    data: [
      {
        name: "E46 M3 Rear Seat Lateral Trim Panel Imola Red Left",
        partNo: "52207903035",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "E46 M3 Rear Seat Lateral Trim Panel Imola Red Right",
        partNo: "52207903036",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "E46 M3 Door Cards Imola Red Driver Front",
        partNo: "51417890952",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "E46 M3 Door Cards Imola Red Passenger Front",
        partNo: "51417890951",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "E46 M3 Door Cards Imola Red Passenger Driver Rear",
        partNo: "51437890784",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "E46 M3 Door Cards Imola Red Passenger Driver Rear",
        partNo: "51437890784",
        donorVin: "WBSBL92060JR08716",
      },
      {
        name: "Cylinder Head Cover Right",
        partNo: "11121702856",
        donorVin: "WBADN22000GE68930",
      },
      {
        name: "Cylinder Head Cover Left",
        partNo: "11121702857",
        donorVin: "WBADN22000GE68930",
      },
      {
        name: "Master Window Lifter Driver Switch",
        partNo: "61319362126",
        donorVin: "WBS3R922090K345058",
      },
    ],
  });
  console.log(cars, donors);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
