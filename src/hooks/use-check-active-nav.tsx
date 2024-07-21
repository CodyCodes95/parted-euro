import { usePathname } from "next/navigation";

export default function useCheckActiveNav() {
  const pathname = usePathname();

  const checkActiveNav = (nav: string) => {
    return pathname === nav;
  };

  return { checkActiveNav };
}
