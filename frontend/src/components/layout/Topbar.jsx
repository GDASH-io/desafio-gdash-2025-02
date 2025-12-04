import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, LogOut, Server, LayoutDashboard } from "lucide-react";

export default function Topbar() {
  const [userName, setUserName] = useState("...");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <header
      className={`
        w-full h-16 flex items-center justify-between px-4 sm:px-6
        border-b
        transition-colors duration-300
        ${theme === "light" ? "bg-white border-gray-200 text-gray-600" : "bg-gray-800 border-gray-700 text-gray-200"}
      `}
    >
      {/* Mobile: Olá no canto esquerdo */}
      <span className="font-medium md:hidden">Olá, {userName} 👋</span>

      {/* Desktop: Olá à direita */}
      <span className="hidden md:inline font-medium ml-auto">Olá, {userName} 👋</span>

      {/* Mobile: botões no canto direito */}
      <div className="flex gap-3 md:hidden">
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="API"
        >
          <LayoutDashboard size={20} />
        </button>
        <button
          onClick={() => window.location.href = "/api"}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="API"
        >
          <Server size={20} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title={theme === "light" ? "Modo Escuro" : "Modo Claro"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          onClick={logout}
          className="p-2 rounded-md text-red-500 hover:text-red-400 transition"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
