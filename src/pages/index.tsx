import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import carImg from "../../public/car.jpg";
import { trpc } from "../utils/trpc";
import { Button } from "@material-tailwind/react";
import { useEffect, useMemo, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Select from "react-select";

interface IOptions {
  label: string;
  value: string;
}

const Home: NextPage = () => {
  const [carSelectOpen, setCarSelectOpen] = useState<boolean>(false);
  const [series, setSeries] = useState<string>("");
  const [generation, setGeneration] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [seriesOptions, setSeriesOptions] = useState<Array<IOptions>>([]);
  const [generationOptions, setGenerationOptions] = useState<Array<IOptions>>(
    []
  );
  const [modelOptions, setModelOptions] = useState<Array<IOptions>>([]);

  const cars = trpc.cars.getAllSeries.useQuery(
    {},
    {
      onSuccess: (data) => {
        setSeriesOptions(data.series);
      },
    }
  );

  const generations = trpc.cars.getMatchingGenerations.useQuery(
    { series },
    {
      enabled: series !== "",
      onSuccess: (data) => {
        setGenerationOptions(data.generations);
      },
    }
  );

  const models = trpc.cars.getMatchingModels.useQuery(
    { series, generation },
    {
      enabled: generation !== "",
      onSuccess: (data) => {
        setModelOptions(data.models);
      },
    }
  );

  return (
    <>
      <Head>
        <title>Parted Euro</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex w-full items-center justify-center">
          <img
            src={carImg.src}
            alt="hero"
            className="max-h-screen w-full object-cover"
          />
          <div className="absolute w-[50%] text-center text-white">
            <div className="flex w-full flex-col items-center">
              <div
                className={`absolute w-full duration-150 ease-linear ${
                  carSelectOpen ? "translate-x-[-100rem]" : ""
                }`}
              >
                <h4 className="text-3xl">BMW Spare Parts Specialists</h4>
                <p className="mt-2 text-xl">
                  Shop our wide range of second-hand parts from various
                  BMW&apos;s.
                </p>
                <div className="mt-4 flex  justify-around ">
                  <Button
                    className="ml-28 border-white text-sm text-white"
                    variant="outlined"
                    onClick={() => setCarSelectOpen(!carSelectOpen)}
                  >
                    Shop By Car
                  </Button>
                  <Button
                    className="mr-28 border-white text-sm text-white"
                    variant="outlined"
                  >
                    Browse ALl
                  </Button>
                </div>
              </div>
              {/* right-[-100rem] duration-150 ease-linear ${carSelectOpen ? "translate-x-[-100rem]" : "" */}
              <div
                className={` absolute translate-x-[100rem] duration-150 ease-linear ${
                  carSelectOpen ? "translate-x-[0rem]" : ""
                }`}
              >
                <div className="mt-4 flex items-center justify-center text-black">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setCarSelectOpen(!carSelectOpen);
                      setSeries("");
                      setGeneration("");
                      setModel("");
                    }}
                  >
                    <ArrowBackIcon fontSize="large" className="text-white" />
                  </div>
                  <Select
                    className="mx-4 w-36"
                    placeholder="Series"
                    options={seriesOptions}
                    onChange={(e) => setSeries(e.value)}
                  />
                  <Select
                    className="mx-4 w-36"
                    placeholder="Generation"
                    options={generationOptions}
                    onChange={(e) => setGeneration(e.value)}
                    isDisabled={generationOptions.length === 0}
                  />
                  <Select
                    className="mx-4 w-36"
                    placeholder="Model"
                    options={modelOptions}
                    onChange={(e) => setModel(e.value)}
                    isDisabled={modelOptions.length === 0}
                  />
                  <Button
                    onClick={() => window.location.href = `/listings?series=${series}&generation=${generation}&model=${model}`}
                    className="border-white text-sm text-white"
                    variant="outlined"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined },
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => signOut() : () => signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
