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
import { Suspense, useEffect } from "react";
import { useSetXeroToken } from "./hooks/useSetXeroToken";
import { useSetEbayToken } from "./hooks/useSetEbayToken";
import WebsiteTab from './components/WebsiteTab';

const XeroTab = () => {
  useSetXeroToken();
  const testConnection = trpc.xero.testXeroConnection.useQuery();
  if (testConnection.isLoading)
    return (
      <div className="flex w-full items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin" />
      </div>
    );

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

const EbayTab = () => {
  useSetEbayToken();
  const testConnection = trpc.ebay.testEbayConnection.useQuery();

  if (testConnection.isLoading)
    return (
      <div className="flex w-full items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin" />
      </div>
    );

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

const Settings = () => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <Suspense>
        <SettingsTabs />
      </Suspense>
    </div>
  );
};

export default Settings;

const SettingsTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeTab = (tab: string) => {
    router.push(`/admin/settings?tab=${tab}`);
  };

  return (
    <Tabs
      onValueChange={(value) => changeTab(value)}
      orientation="vertical"
      defaultValue={searchParams?.get("tab") ?? "xero"}
      className="space-y-4"
    >
      <div className="w-full overflow-x-auto pb-2">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="xero">Xero</TabsTrigger>
          <TabsTrigger value="ebay">Ebay</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="website" className="space-y-4">
        <WebsiteTab />
      </TabsContent>
      <TabsContent value="xero" className="space-y-4">
        <XeroTab />
      </TabsContent>
      <TabsContent value="ebay" className="space-y-4">
        <EbayTab />
      </TabsContent>
    </Tabs>
  );
};