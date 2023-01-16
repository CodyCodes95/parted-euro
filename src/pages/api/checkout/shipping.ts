export default async function getShippingCost(req: any, res: any) {
  const { from, to, weight, length, width, height } = JSON.parse(req.body)

  console.log(req.body)

  const ausPostRes = await fetch(
    `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?length=${length}&width=${width}&height=${height}&weight=${weight}&from_postcode=${from}&to_postcode=${to}`,
    {
      method: "GET",
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    }
  );
  const data = await ausPostRes.json();
  const express = data.services.service.find((service: any) => service.code === "AUS_PARCEL_EXPRESS").price;
  const regular = data.services.service.find(
    (service: any) => service.code === "AUS_PARCEL_REGULAR"
  ).price;
  res.json({ express: express, regular: regular})
}
