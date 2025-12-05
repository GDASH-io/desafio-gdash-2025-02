import { AppSideBar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { Route, Routes } from "react-router";
import { AppBreadcrumb } from "@/components/BreadCrumbApp";
import { userAtom } from "@/atom/store";
import { useAtomValue } from "jotai";
import { Loader } from "@/components/Loader";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { MOBILE_BREAKPOINT } from "@/hooks/use-mobile";
import { lazy } from "react";
import { Button } from "@/components/ui/button";
import { useWeatherXlsx } from "@/hooks/useWeatherXlsx";

const DashBoardHome = lazy(() =>
  import("../../components/DashBoardHome").then(module => ({ default: module.DashBoardHome }))
);
const DashBoardGraphics = lazy(() =>
  import("../../components/DashBoardGraphics").then(module => ({ default: module.DashBoardGraphics }))
);
const RequireRole = lazy(() =>
  import("../../components/RequireRole").then(module => ({ default: module.RequireRole }))
);
const DashBoardUsers = lazy(() =>
  import("../../components/DashBoardUsers").then(module => ({ default: module.DashBoardUsers }))
);
const AccountMenagement = lazy(() =>
  import("../../components/AccountMenagement").then(module => ({ default: module.AccountMenagement }))
);

export function DashBoard() {
  const user = useAtomValue(userAtom);
  const windowWidth = useWindowWidth();
  const handleWeatherDataDownload = useWeatherXlsx();

  return (
    <SidebarProvider defaultOpen={true} className="flex">
      <AppSideBar userEmail={user!.email} userName={user!.name} />
      <div className="w-full max-w-full">
        <header
          className={`
            lg:pl-5
            pr-3
            flex justify-between
            items-center w-full 
            bg-accent h-13
        `}>
          <div className="flex items-center">
            {(windowWidth < MOBILE_BREAKPOINT) && (<>
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </>)}
            <AppBreadcrumb />
          </div>
          <Button onClick={()=>handleWeatherDataDownload()}>Baixar dados</Button>
        </header>
        <Loader>
          <main className="p-2 w-full">
            <Routes>
              <Route index element={<DashBoardHome />} />
              <Route path="/graphics" element={<DashBoardGraphics />} />
              <Route path="/users" element={
                <RequireRole>
                  <DashBoardUsers />
                </RequireRole>
              } />
              <Route path="/account" element={<AccountMenagement />} />
              <Route path="*" element={
                <div className="relative w-full h-dvh">
                  <Card className="absolute top-1/2 left-1/2 -translate-1/2">
                    <CardContent>
                      <CardTitle className="text-center text-base">Página não encontrada!</CardTitle>
                      <CardDescription className="text-center mt-3">Contate o suporte</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              } />
            </Routes>
          </main>
        </Loader>
      </div>
    </SidebarProvider>
  )
}