import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex w-full h-screen relative">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
