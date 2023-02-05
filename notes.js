// // const inventoryLocation =
// //   await ebay.sell.inventory.createInventoryLocation(
// //     "parted-euro-knox",
// //     {
// //       location: {
// //         address: {
// //           addressLine1: "123 fake street",
// //           addressLine2: "2",
// //           city: "Knox",
// //           country: "AU",
// //           stateOrProvince: "VIC",
// //           postalCode: "3152",
// //         },
// //       },
// //       name: "Parted Euro",
// //       locationWebUrl: "https://parted-euro.vercel.app/",
// //       locationTypes: ["WAREHOUSE"],
// //       locationInstructions: "Items ship from here",
// //       merchantLocationStatus: "ENABLED",
// //     } as InventoryLocationFull
// //   );
// // const inventoryLocation =
// // await ebay.sell.inventory.getInventoryLocations();
// // const policies = await ebay.sell.account.getPaymentPolicies("EBAY_AU")
// // const categoryTreeId = await ebay.commerce.taxonomy.getDefaultCategoryTreeId("EBAY_AU") //logged 15, used in req below
// // const sellItem = await ebay.commerce.taxonomy.getCategorySuggestions("15", "GoPro Hero4 Helmet Cam") logged {categoryId: '30093', categoryName: 'Tripods & Monopods'}. Wondering how often
// // this changes? if not often, will just use a generic car parts category for all reqs. If they change, will have to grab on each fetch
// // if (publishOffer) {
// //  console.log("SUCCESS")
// // }


//     // const publishOffer = await ebay.sell.inventory.deleteInventoryItem(
//     //   "clclircoz000ueh05h7t36a31"
//     // );
//     // return publishOffer;

//             const createInventoryItem =
//           await ebay.sell.inventory.createOrReplaceInventoryItem(
//             input.listingId,
//             {
//               availability: {
//                 shipToLocationAvailability: {
//                   quantity: input.quantity,
//                 },
//               },
//               condition: input.condition as Condition,
//               product: {
//                 title: input.title,
//                 description: `${input.description}, ${input.conditionDescription}`,
//                 aspects: {
//                   Brand: ["BMW"],
//                   // Type: ["Helmet/Action"],
//                   // "Storage Type": ["Removable"],
//                   // "Recording Definition": ["High Definition"],
//                   // "Media Format": ["Flash Drive (SSD)"],
//                   // "Optical Zoom": ["10x"],
//                   // "Model": ["Hero4"],
//                 },
//                 // brand: "GoPro",
//                 mpn: input.partNo,
//                 brand: "BMW",
//                 imageUrls: input.images,
//               },
//             }
//           );