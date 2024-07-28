import { trpc } from "@/utils/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useSetEbayToken = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams?.get("code");

  const setEbayToken = trpc.ebay.setTokenSet.useMutation();
  useEffect(() => {
    if (!code) return;
    setEbayToken.mutateAsync({
      code,
    });
    router.push("/admin/settings?tab=ebay");
  }, [code]);
  return null;
};
