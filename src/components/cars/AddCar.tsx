import { useState, useEffect } from "react";
import { trpc } from "../../utils/trpc";
import FormSection from "../FormSection";
import type { Car } from "@prisma/client";
import Modal from "../modals/Modal";
import { toast } from "sonner";
import { Button } from "../ui/button";

type AddCarProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  car?: Car | null;
  refetch: () => void;
};

const AddCar: React.FC<AddCarProps> = ({
  showModal,
  setShowModal,
  car,
  refetch,
}) => {
  const [make, setMake] = useState<string>(car?.make ?? "BMW");
  const [series, setSeries] = useState<string>(car?.series ?? "");
  const [generation, setGeneration] = useState<string>(car?.generation ?? "");
  const [model, setModel] = useState<string>(car?.model ?? "");
  const [showBody, setShowBody] = useState<boolean>(false);
  const [body, setBody] = useState<string>(car?.body ?? "");

  // Get all available car makes
  const makes = trpc.cars.getAllMakes.useQuery();

  // Get series filtered by the selected make
  const seriesData = trpc.cars.getAllSeries.useQuery({ make });

  // Get generations when series is selected
  const generationsData = trpc.cars.getMatchingGenerations.useQuery(
    { series, make },
    { enabled: !!series },
  );

  // Get models when generation is selected
  const modelsData = trpc.cars.getMatchingModels.useQuery(
    { series, generation, make },
    { enabled: !!series && !!generation },
  );

  const saveCar = trpc.cars.createCar.useMutation();
  const updateCar = trpc.cars.updateCar.useMutation();

  // Reset dependent fields when make changes
  useEffect(() => {
    if (!car) {
      // Only reset fields when not editing an existing car
      setSeries("");
      setGeneration("");
      setModel("");
      setBody("");
    }
  }, [make, car]);

  // Reset dependent fields when series changes
  useEffect(() => {
    if (!car) {
      // Only reset fields when not editing an existing car
      setGeneration("");
      setModel("");
      setBody("");
    }
  }, [series, car]);

  // Reset dependent fields when generation changes
  useEffect(() => {
    if (!car) {
      // Only reset fields when not editing an existing car
      setModel("");
      setBody("");
    }
  }, [generation, car]);

  const onSave = async (exit: boolean) => {
    const carData = {
      make,
      series,
      generation,
      model,
      body: body ?? null,
    };

    if (car) {
      // Update existing car
      await updateCar.mutateAsync(
        {
          id: car.id,
          ...carData,
        },
        {
          onSuccess: (data) => {
            toast.success(`${generation} ${model} updated successfully`);
            refetch();
            if (exit) {
              setShowModal(false);
            }
          },
          onError: (err) => {
            toast.error(err.message);
          },
        },
      );
    } else {
      // Create new car
      await saveCar.mutateAsync(carData, {
        onSuccess: (data) => {
          toast.success(`${generation} ${model} added successfully`);
          refetch();
          if (exit) {
            setShowModal(false);
          }
          setSeries("");
          setGeneration("");
          setModel("");
          setBody("");
        },
        onError: (err) => {
          toast.error(err.message);
        },
      });
    }
  };

  // Convert makes array to the format expected by FormSection
  const makeOptions =
    makes.data?.map((make) => ({
      value: make,
      label: make,
    })) ?? [];

  return (
    <Modal
      isOpen={showModal}
      setIsOpen={setShowModal}
      title={car ? "Edit Car" : "Add Car"}
    >
      <div className="space-y-6 p-6">
        <FormSection
          title="Make"
          data={makeOptions}
          value={make}
          setValue={setMake}
        />
        <FormSection
          title="Series"
          data={seriesData.data?.series ?? []}
          value={series}
          setValue={setSeries}
        />
        <FormSection
          title="Generation"
          data={generationsData.data?.generations ?? []}
          value={generation}
          setValue={setGeneration}
          disabled={!series}
        />
        <FormSection
          title="Model"
          data={modelsData.data?.models ?? []}
          value={model}
          setValue={setModel}
          disabled={!generation}
        />
        <p
          className="cursor-pointer text-blue-600"
          onMouseDown={() => setShowBody(!showBody)}
        >
          There are multiple bodies for this model
        </p>
        {showBody && (
          <FormSection title="Body" data={[]} value={body} setValue={setBody} />
        )}
      </div>
      <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
        <Button onMouseDown={() => onSave(true)}>Save and Exit</Button>
        <Button onMouseDown={() => onSave(false)}>Save</Button>
      </div>
    </Modal>
  );
};

export default AddCar;
