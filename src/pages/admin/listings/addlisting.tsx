import { NextPage } from "next";
import React, { useEffect } from "react";
import { trpc } from "../../../utils/trpc";

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
      price: price,
      weight: weight,
      length: length,
      width: width,
      height: height,
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
    <div className="relative h-full w-full max-w-2xl md:h-auto">
      <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
        <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add a listing
          </h3>
        </div>
        <div className="space-y-6 p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <input
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Price
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) * 100)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Weight
            </label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) * 1000)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Price
            </label>
            <input
              type="text"
              value={length}
              onChange={(e) => setLength(Number(e.target.value) * 10)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Width
            </label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) * 10)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Height
            </label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) * 10)}
              className={` block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500`}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
          <button
            onClick={onSave as any}
            data-modal-toggle="defaultModal"
            type="button"
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Save listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
