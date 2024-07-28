"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { Check, Loader2, TriangleAlert } from "lucide-react";
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

const XeroTab = () => {
  useSetXeroToken();
  const testConnection = trpc.xero.testXeroConnection.useQuery();
  if (testConnection.isLoading)
    return <Loader2 className="h-32 w-32 animate-spin" />;

  if (!testConnection.data)
    return (
      <div className="flex w-full items-center justify-center">
        <TriangleAlert className="h-32 w-32 text-red-500" />
        <p className="mt-4 text-xl">
          Error connecting to Xero, please try refresh
        </p>
      </div>
    );

  return (
    <div className="flex w-full items-center justify-center">
      <Check className="h-32 w-32 text-green-500" />
      <p className="mt-4 text-xl">Xero connection successful</p>
    </div>
  );
};

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
const EbayTab = () => {
  useSetEbayToken();
  const testConnection = trpc.ebay.testEbayConnection.useQuery();

  if (testConnection.isLoading)
    return <Loader2 className="flex w-full items-center justify-center" />;

  if (!testConnection.data)
    return (
      <div className="flex w-full items-center justify-center">
        <TriangleAlert className="h-32 w-32 text-red-500" />
        <p className="mt-4 text-xl">
          Error connecting to Ebay, please try refresh
        </p>
      </div>
    );

  return (
    <div className="flex w-full items-center justify-center">
      <Check className="h-32 w-32 text-green-500" />
      <p className="mt-4 text-xl">Ebay connection successful</p>
    </div>
  );
};

const HomepageTab = () => null;

const Settings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const changeTab = (tab: string) => {
    console.log("change");
    router.push(`/admin/settings?tab=${tab}`);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <Tabs
        onValueChange={(value) => changeTab(value)}
        orientation="vertical"
        defaultValue={searchParams?.get("tab") ?? "xero"}
        className="space-y-4"
      >
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="xero">Xero</TabsTrigger>
            <TabsTrigger onClick={() => changeTab("ebay")} value="ebay">
              Ebay
            </TabsTrigger>
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="xero" className="space-y-4">
          <XeroTab />
        </TabsContent>
        <TabsContent value="ebay" className="space-y-4">
          <EbayTab />
        </TabsContent>
        <TabsContent value="homepage" className="space-y-4">
          <HomepageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
