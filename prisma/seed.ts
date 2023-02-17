import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // const cars = [
  //   {
  //     make: "BMW",
  //     series: "1 Series",
  //     generation: "E87",
  //     models: ["116i", "118i", "120i", "130i", "M135i"],
  //   },
  //   {
  //     make: "BMW",
  //     series: "1 Series",
  //     generation: "F20/F21",
  //     models: ["116i", "118i", "120i", "125i", "M135i", "M140i"],
  //   },
  //   {
  //     make: "BMW",
  //     series: "2 Series",
  //     generation: "F22/F23",
  //     models: ["218i", "220i", "228i", "M235i", "M240i"],
  //   },
  //   {
  //     make: "BMW",
  //     series: "2 Series",
  //     generation: "F87",
  //     models: ["M2"],
  //   },
  //   {
  //     make: "BMW",
  //     series: "2 Series",
  //     generation: "F44",
  //     models: ["218i", "220i", "M235i"],
  //   },
  //   {
  //     make: "BMW",
  //     series: "2 Series",
  //     generation: "G42",
  //     models: ["220i", "M240i"],
  //   },
  // ];

  // cars.map(async (car: any) => {
  //   return car.models.map(async (model: any) => {
  //     return await prisma.car.create({
  //       data: {
  //         make: car.make,
  //         series: car.series,
  //         generation: car.generation,
  //         model: model,
  //       },
  //     });
  //   });
  // });

  // const cars = await prisma.car.createMany({
  //   data: [
  //     {
  //       make: "BMW",
  //       series: "3 Series",
  //       generation: "E46",
  //       model: "M3",
  //       body: "Coupe",
  //     },
  //     {
  //       make: "BMW",
  //       series: "3 Series",
  //       generation: "E46",
  //       model: "M3",
  //       body: "Convertible",
  //     },
  //     {
  //       make: "BMW",
  //       series: "3 Series",
  //       generation: "E36",
  //       model: "M3",
  //     },
  //     {
  //       make: "BMW",
  //       series: "5 Series",
  //       generation: "E39",
  //       model: "M5",
  //     },
  //     {
  //       make: "BMW",
  //       series: "5 Series",
  //       generation: "E39",
  //       model: "535i",
  //     },
  //     {
  //       make: "BMW",
  //       series: "5 Series",
  //       generation: "E60",
  //       model: "M5",
  //     },
  //     {
  //       make: "BMW",
  //       series: "7 Series",
  //       generation: "E38",
  //       model: "728i",
  //     },
  //     {
  //       make: "BMW",
  //       series: "8 Series",
  //       generation: "E31",
  //       model: "840Ci",
  //     },
  //     {
  //       make: "BMW",
  //       series: "5 Series",
  //       generation: "E34",
  //       model: "525i",
  //     },
  //     {
  //       make: "BMW",
  //       series: "X Series",
  //       generation: "E53",
  //       model: "X5",
  //     },
  //     {
  //       make: "BMW",
  //       series: "F Series",
  //       generation: "F30",
  //       model: "328i",
  //     },
  //     {
  //       make: "BMW",
  //       series: "F Series",
  //       generation: "F80",
  //       model: "M3",
  //     },
  //     {
  //       make: "BMW",
  //       series: "F Series",
  //       generation: "F82",
  //       model: "M4",
  //     },
  //     {
  //       make: "BMW",
  //       series: "F Series",
  //       generation: "F83",
  //       model: "M4",
  //     },
  //     {
  //       make: "All",
  //       series: "0 Series",
  //       generation: "E00",
  //       model: "E00",
  //     },
  //   ],
  // });
  // const firstCar = await prisma.car.findFirst();
  // const vert = await prisma.car.findFirst({
  //   where: {
  //     body: "Convertible",
  //   },
  // });
  // const fiveSeries = await prisma.car.findFirst({
  //   where: {
  //     model: "535i",
  //   },
  // });
  // const m3 = await prisma.car.findFirst({
  //   where: {
  //     generation: "F80",
  //   },
  // });
  // const m4 = await prisma.car.findFirst({
  //   where: {
  //     generation: "F82",
  //   },
  // });
  // const genericDonor = await prisma.car.findFirst({
  //   where: {
  //     generation: "E00",
  //   },
  // });

  // const donors = await prisma.donor.createMany({
  //   data: [
  //     {
  //       vin: "0000000000",
  //       year: 1990,
  //       cost: 0,
  //       mileage: 0,
  //       carId: genericDonor?.id || "",
  //     },
  //     {
  //       vin: "WBSBL92060JR08716",
  //       year: 2003,
  //       cost: 2300000,
  //       mileage: 141000,
  //       carId: firstCar?.id || "",
  //     },
  //     {
  //       vin: "WBADN22000GE68930",
  //       year: 1999,
  //       cost: 1500000,
  //       mileage: 220000,
  //       carId: fiveSeries?.id || "",
  //     },
  //     {
  //       vin: "WBS3R922090K345058",
  //       year: 2016,
  //       cost: 3000000,
  //       mileage: 24000,
  //       carId: m4?.id || "",
  //     },
  //     {
  //       vin: "WBS8M920105G47739",
  //       year: 2015,
  //       cost: 4000000,
  //       mileage: 21000,
  //       carId: m3?.id || "",
  //     },
  //   ],
  // });

  // const partType = await prisma.partTypes.create({
  //   data: {
  //     name: "Interior",
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "E46 M3 Rear Seat Lateral Trim Panel Left",
  //     partNo: "52207903035",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: {
  //         id: firstCar?.id || "",
  //       },
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "E46 M3 Rear Seat Lateral Trim Panel Right",
  //     partNo: "52207903036",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: {
  //         id: firstCar?.id || "",
  //       },
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "E46 M3 Door Cards Driver Front",
  //     partNo: "51417890952",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: [
  //         {
  //           id: firstCar?.id || "",
  //         },
  //         {
  //           id: vert?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "E46 M3 Door Cards Passenger Front",
  //     partNo: "51417890951",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: [
  //         {
  //           id: firstCar?.id || "",
  //         },
  //         {
  //           id: vert?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "E46 M3 Door Cards Passenger Driver Rear",
  //     partNo: "51437890784",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: [
  //         {
  //           id: firstCar?.id || "",
  //         },
  //         {
  //           id: vert?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "Cylinder Head Cover Right",
  //     partNo: "11121702856",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: {
  //         id: fiveSeries?.id || "",
  //       },
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "Cylinder Head Cover Left",
  //     partNo: "11121702857",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: {
  //         id: fiveSeries?.id || "",
  //       },
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "Master Window Lifter Driver Switch",
  //     partNo: "61319362126",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: {
  //         id: m4?.id || "",
  //       },
  //     },
  //   },
  // });

  // await prisma.partDetail.create({
  //   data: {
  //     name: "F8X M3 / M4 Passenger Air Vent",
  //     partNo: "64229346226",
  //     partType: {
  //       connect: {
  //         id: partType.id || "",
  //       },
  //     },
  //     cars: {
  //       connect: [
  //         {
  //           id: m3?.id || "",
  //         },
  //         {
  //           id: m4?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // const parts = await prisma.part.createMany({
  //   data: [
  //     {
  //       partDetailsId: "52207903035",
  //       donorVin: "WBSBL92060JR08716",
  //     },
  //     {
  //       partDetailsId: "52207903036",
  //       donorVin: "WBSBL92060JR08716",
  //     },
  //     {
  //       partDetailsId: "51417890952",
  //       donorVin: "WBSBL92060JR08716",
  //     },
  //     {
  //       partDetailsId: "51417890951",
  //       donorVin: "WBSBL92060JR08716",
  //     },
  //     {
  //       partDetailsId: "51437890784",
  //       donorVin: "WBSBL92060JR08716",
  //     },
  //     {
  //       partDetailsId: "11121702856",
  //       donorVin: "WBADN22000GE68930",
  //     },
  //     {
  //       partDetailsId: "11121702857",
  //       donorVin: "WBADN22000GE68930",
  //     },
  //     {
  //       partDetailsId: "11121702857",
  //       donorVin: "WBS3R922090K345058",
  //     },
  //     {
  //       partDetailsId: "64229346226",
  //       donorVin: "WBS3R922090K345058",
  //     },
  //     {
  //       partDetailsId: "64229346226",
  //       donorVin: "WBS8M920105G47739",
  //     },
  //   ],
  // });

  // const partLeft = await prisma.part.findFirst({});
  // const partRight = await prisma.part.findFirst({
  //   where: {
  //     partDetailsId: "52207903036",
  //   },
  // });
  // const headCoverLeft = await prisma.part.findFirst({
  //   where: {
  //     partDetailsId: "11121702856",
  //   },
  // });
  // const headCoverRight = await prisma.part.findFirst({
  //   where: {
  //     partDetailsId: "11121702857",
  //   },
  // });
  // const firstAirVent = await prisma.part.findFirst({
  //   where: {
  //     partDetailsId: "64229346226",
  //     donorVin: "WBS3R922090K345058",
  //   },
  // });
  // const secondAirVent = await prisma.part.findFirst({
  //   where: {
  //     partDetailsId: "64229346226",
  //     donorVin: "WBS8M920105G47739",
  //   },
  // });

  // const singleItemListing = await prisma.listing.create({
  //   data: {
  //     title: "E46 M3 Rear Seat Lateral Trim Panel Left",
  //     description: "E46 M3 Rear Seat Lateral Trim Panel Set",
  //     condition: "Good",
  //     price: 5000,
  //     weight: 10,
  //     height: 10,
  //     width: 10,
  //     length: 10,
  //     active: true,
  //     parts: {
  //       connect: {
  //         id: partLeft?.id || "",
  //       },
  //     },
  //   },
  // });

  // const setListing = await prisma.listing.create({
  //   data: {
  //     title: "E46 M3 Rear Seat Lateral Trim Panel Set",
  //     description: "E46 M3 Rear Seat Lateral Trim Panel Set",
  //     condition: "Whole set is immaculate",
  //     price: 10000,
  //     weight: 20,
  //     height: 10,
  //     width: 10,
  //     length: 10,
  //     active: true,
  //     parts: {
  //       connect: [
  //         {
  //           id: partLeft?.id || "",
  //         },
  //         {
  //           id: partRight?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // const headCoverListing = await prisma.listing.create({
  //   data: {
  //     title: "E39 Cylinder Head Cover Set",
  //     description: "E39 Cylinder Head Cover Set",
  //     condition: "Good",
  //     price: 4500,
  //     weight: 20,
  //     height: 10,
  //     width: 10,
  //     length: 10,
  //     active: true,
  //     parts: {
  //       connect: [
  //         {
  //           id: headCoverLeft?.id || "",
  //         },
  //         {
  //           id: headCoverRight?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // const airVentListing = await prisma.listing.create({
  //   data: {
  //     title: "F8X M3 / M4 Air Vent Set",
  //     description: "F8X M3 / M4 Air Vent Set",
  //     condition: "Good",
  //     price: 4000,
  //     weight: 20,
  //     height: 10,
  //     width: 10,
  //     length: 10,
  //     active: true,
  //     parts: {
  //       connect: [
  //         {
  //           id: firstAirVent?.id || "",
  //         },
  //         {
  //           id: secondAirVent?.id || "",
  //         },
  //       ],
  //     },
  //   },
  // });

  // const listings = await prisma.listing.findMany({});

  // const imagePromises = listings.map((listing) => {
  //   return prisma.image.create({
  //     data: {
  //       url: "https://res.cloudinary.com/codycodes/image/upload/v1672892980/listings/imzoxml30hu9npbwgtq0.png",
  //       listingId: listing?.id || "",
  //     },
  //   });
  // });

  // await Promise.all(imagePromises);

  // const images = await prisma.image.findMany({});

  // console.log(
  //   cars,
  //   donors,
  //   parts,
  //   { listings: listings.length },
  //   { images: images.length }
  // );
}
main()
  .then(async () => {
    console.log("DONE");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
