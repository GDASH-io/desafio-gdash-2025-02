"use client";

import type { ReactNode } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";

import {
  Sidebar,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarContent,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  Zap,
  Rocket,
} from "lucide-react";
import { NavUser } from "./NavUser";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Separator } from "@radix-ui/react-separator";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Usuários", path: "/users", icon: Users },
  { name: "SpaceX Launches" , path:"/launches", icon: Rocket}
];

export default function DashboardLayout() {
  const location = useLocation();
  const { name: userName, email: userEmail } = useAuthUser()

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">

        {/* ===== SIDEBAR ===== */}
        <Sidebar collapsible="icon" variant="inset" className="border-none shadow-sm">

          <SidebarHeader>
            <SidebarGroupLabel className="flex items-center gap-4">
              <Zap className="!siz-5 text-teal-600" />
              <span className="font-bold text-lg text-slate-600">
                GDASH-io
              </span>
            </SidebarGroupLabel>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;

                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.name}
                          className="data-[active=true]:text-white hover:text-white font-semibold" // tooltip automático no colapsado
                        >
                          <Link to={item.path}>
                            <Icon className="size-5" />
                            {/* texto some quando colapsado */}
                            <span className="sidebar-expanded:inline sidebar-collapsed:hidden">
                              {item.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <NavUser user={{name: userName, email: userEmail}}/>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <main className="flex flex-col flex-1 flex-grow w-full gap-4 p-4">
            {/* Botão para recolher/expandir o sidebar */}
            <SidebarTrigger className="mb-4 text-slate-500"/>
            <Separator orientation="vertical" className="bg-slate-500 border-red-600"/>
            <Outlet />
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
