import Link from "next/link";
import { useEffect, useRef } from "react";

interface GenerationMenuProps {
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  linkRef: React.RefObject<HTMLDivElement>;
}

const GenerationMenu:React.FC<GenerationMenuProps> = ({setExpanded, linkRef}) => {

  const popUpRef = useRef<HTMLDivElement>(null);

   const closePopup = (e: any) => {
     if (popUpRef.current && (!popUpRef.current.contains(e.target) && !linkRef.current?.contains(e.target))) {
       setExpanded(false);
     }
   };

   useEffect(() => {
     document.addEventListener("mousedown", closePopup);
   }, []);

  return (
    <div
      ref={popUpRef}
      className="absolute left-0 z-[200] flex w-screen translate-y-7 border-b-2 bg-white"
    >
      <div className="ml-20 mr-20 grid w-full grid-cols-6 gap-x-16 gap-y-8 p-8">
        <div className="flex flex-col">
          <h4>F8X - M2/M3/M4</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All F8X Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            F8X Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            F8X Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            F8X Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            F8X Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            F8X Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E36 - 3 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E36 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E36 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E36 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E36 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E36 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E36 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E46 - 3 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E46 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E46 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E46 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E46 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E46 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E46 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E34 - 5 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E34 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E34 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E34 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E34 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E34 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E34 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E39 - 5 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E39 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E39 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E39 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E39 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E39 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E39 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E38 - 7 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E38 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E38 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E38 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E38 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E38 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E38 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E31 - 8 Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E31 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E31 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E31 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E31 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E31 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E31 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E53 - X Series</h4>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            All E53 Parts
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E53 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E53 Suspension and & Brakes
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E53 Interior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E53 Exterior
          </Link>
          <Link
            className="py-3 text-sm text-[#4d4d4d] hover:underline"
            href={""}
          >
            E53 Electrical Modules & Controllers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GenerationMenu;
