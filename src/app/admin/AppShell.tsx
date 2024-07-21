"use client";
import useIsCollapsed from "@/hooks/use-is-collapsed";
import React from "react";
import { Layout, Sidebar } from "./sidebar";
import ThemeSwitch from "@/components/admin/theme-switch";
import { UserNav } from "@/components/admin/user-nav";

const AppShell = ({ children }: React.PropsWithChildren) => {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed();
  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${
          isCollapsed ? "md:ml-14" : "md:ml-64"
        } h-full`}
      >
        <Layout fixed>
          {/* ===== Top Heading ===== */}
          <Layout.Header>
            <div className="flex w-full items-center justify-between">
              <div />
              <div className="flex items-center space-x-4">
                <ThemeSwitch />
                <UserNav />
              </div>
            </div>
          </Layout.Header>

          {/* ===== Content ===== */}
          <Layout.Body className="flex flex-col">{children}</Layout.Body>
        </Layout>
      </main>
    </div>
  );
};

export default AppShell;
