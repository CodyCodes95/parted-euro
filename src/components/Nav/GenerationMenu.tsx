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
      <div className="grid w-full grid-cols-6 gap-x-16 gap-y-8  px-4 2xl:ml-20 2xl:mr-20 2xl:px-8 2xl:py-8">
        <div className="flex flex-col">
          <h4>F8X - M2/M3/M4</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=F8"}
          >
            All F8X Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=F8"}
          >
            F8X Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=F8"}
          >
            F8X Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=F8"}
          >
            F8X Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=F8"}
          >
            F8X Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=F8"}
          >
            F8X Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E36 - 3 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e36"}
          >
            All E36 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e36"}
          >
            E36 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e36"}
          >
            E36 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e36"}
          >
            E36 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e36"}
          >
            E36 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e36"}
          >
            E36 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E46 - 3 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e46"}
          >
            All E46 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e46"}
          >
            E46 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e46"}
          >
            E46 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e46"}
          >
            E46 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e46"}
          >
            E46 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e46"}
          >
            E46 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E34 - 5 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e34"}
          >
            All E34 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e34"}
          >
            E34 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e34"}
          >
            E34 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e34"}
          >
            E34 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e34"}
          >
            E34 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e34"}
          >
            E34 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E39 - 5 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e39"}
          >
            All E39 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e39"}
            >
            E39 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e39"}
          >
            E39 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e39"}
          >
            E39 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e39"}
          >
            E39 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e39"}
          >
            E39 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E38 - 7 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e38"}
          >
            All E38 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e38"}
          >
            E38 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e38"}
          >
            E38 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e38"}
          >
            E38 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e38"}
          >
            E38 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e38"}
          >
            E38 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E31 - 8 Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e31"}
          >
            All E31 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e31"}
          >
            E31 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e31"}
          >
            E31 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e31"}
          >
            E31 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e31"}
          >
            E31 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e31"}
          >
            E31 Electrical Modules & Controllers
          </Link>
        </div>
        <div className="flex flex-col">
          <h4>E53 - X Series</h4>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?generation=e53"}
          >
            All E53 Parts
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=engine&generation=e53"}
          >
            E53 Engine/Driveline Parts & Accessories
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=suspension&generation=e53"}
          >
            E53 Suspension and & Brakes
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=interior&generation=e53"}
          >
            E53 Interior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=exterior&generation=e53"}
          >
            E53 Exterior
          </Link>
          <Link
            className="py-2 text-sm text-[#4d4d4d] hover:underline 2xl:py-3"
            href={"/listings?category=electrical&generation=e53"}
          >
            E53 Electrical Modules & Controllers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GenerationMenu;
