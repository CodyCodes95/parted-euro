import { trpc } from "@/utils/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useSetXeroToken = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams?.get("code");

  const setXeroToken = trpc.xero.updateTokenset.useMutation();

  useEffect(() => {
    if (!code) return;
    setXeroToken.mutateAsync({
      code,
    });
    router.push("/admin/settings?tab=xero");
  }, [code]);
  return null;
};
