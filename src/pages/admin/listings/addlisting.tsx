import { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { trpc } from "../../../utils/trpc";
import { Input } from "@material-tailwind/react";

const AddListing: NextPage = () => {
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [condition, setCondition] = React.useState<string>("");
  const [price, setPrice] = React.useState<number>(0);
  const [weight, setWeight] = React.useState<number>(0);
  const [length, setLength] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);
  const [parts, setParts] = React.useState<object>([]);

  const cars = trpc.cars.getAll.useQuery();
  const saveListing = trpc.listings.createListing.useMutation();

  const onSave = async () => {
    const result = await saveListing.mutateAsync({
      title: title,
      description: description,
      condition: condition,
      price: (price *100),
      weight: (weight * 1000),
      length: (length * 10),
      width: (width * 10),
      height: (height * 10),
    });
    setTitle("");
    setDescription("");
    setCondition("");
    setPrice(0);
    setWeight(0);
    setLength(0);
    setWidth(0);
    setHeight(0);
  };

  return (
    <>
      <Head>
        <title>Create Listing</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h- justify-center items-center flex-col bg-white">
        <div className="space-y-6 p-6">
          <div className="w-72">
            <Input
              value={title}
              label="Title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="w-72">
            <Input
              value={description}
              label="Description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="w-72">
            <Input
              value={condition}
              label="Condition"
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
          <div className="w-72">
            <Input
              value={price}
              type="number"
              label="Price"
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="w-72">
            <Input
              value={weight}
              type="number"
              label="Weight"
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
          <div className="w-72">
            <Input
              value={length}
              type="number"
              label="Length"
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </div>
          <div className="w-72">
            <Input
              value={width}
              type="number"
              label="Width"
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
          <div className="w-72">
            <Input
              value={height}
              type="number"
              label="Height"
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default AddListing;
