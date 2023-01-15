export default async function getShippingCost(req: any, res: any) {
  const { from, to, weight, length, width, height } = req.body;

  const ausPostRes = await fetch(
    `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?length=${length}&width=${width}&height=${height}&weight=${weight}&from_postcode=${from}&to_postcode=${to}`,
    {
      method: "GET",
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    }
  );
  console.log(ausPostRes);
  res.json(ausPostRes)
}
