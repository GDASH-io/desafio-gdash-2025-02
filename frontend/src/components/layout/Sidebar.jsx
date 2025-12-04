// Sidebar.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, LogOut, LayoutDashboard, Server } from "lucide-react";
import { useState, useRef } from "react";


export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const { theme, setTheme } = useTheme();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const sidebarBg = theme === "dark" ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900";
  const hoverText = theme === "dark" ? "hover:text-gray-300" : "hover:text-gray-700";
  const borderColor = theme === "dark" ? "border-white/20" : "border-gray-300";

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 p-6 flex flex-col justify-between shadow-xl
        transform transition-transform duration-300
        ${sidebarBg}
        md:translate-x-0 md:relative md:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div>
        <div className="flex items-center mb-10 gap-3">
          <img
            src="/logo.png"
            alt="Skyfy Logo"
            className="w-10 h-10 object-contain cursor-pointer"
            onClick={toggleSidebar} // fecha clicando no logo
          />
          <h1 className="text-2xl font-bold tracking-wide">Skyfy</h1>
        </div>

        <nav className="flex flex-col gap-5 text-lg">
          <a href="/dashboard" className={`flex items-center gap-3 transition ${hoverText}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="/api" className={`flex items-center gap-3 transition ${hoverText}`}>
            <Server size={20} />
            API
          </a>
        </nav>
      </div>

      <div className={`flex flex-col gap-5 pt-6 border-t ${borderColor}`}>
        <button onClick={toggleTheme} className={`flex items-center gap-3 transition text-left ${hoverText}`}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {theme === "light" ? "Modo Escuro" : "Modo Claro"}
        </button>

        <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition text-left" onClick={logout}>
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
