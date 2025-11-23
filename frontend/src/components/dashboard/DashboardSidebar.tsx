import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Rocket, Users, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-24 flex flex-col items-center py-8 gap-8 bg-dashboard-card/50 backdrop-blur-sm m-4 rounded-3xl border border-white/5">
      <div className="p-3 bg-dashboard-accent/20 rounded-xl">
        <Zap className="h-8 w-8 text-dashboard-highlight" />
      </div>

      {/* AQUI É A LISTA DE NAVEGAÇÃO PRINCIPAL */}
      <nav className="flex flex-col gap-6 w-full items-center flex-1">
        <SidebarButton
          icon={LayoutDashboard}
          active={location.pathname === "/dashboard"}
          onClick={() => navigate("/dashboard")}
        />

        <SidebarButton
          icon={Rocket}
          active={location.pathname === "/spacex"}
          onClick={() => navigate("/spacex")}
        />

        {/* MOVIDO PARA CÁ (Dentro do nav) */}
        <SidebarButton
          icon={Users}
          active={location.pathname === "/users"}
          onClick={() => navigate("/users")}
        />
      </nav>

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="mt-auto text-red-400 hover:bg-red-900/20 hover:text-red-500"
      >
        <LogOut className="h-6 w-6" />
      </Button>
    </aside>
  );
}

function SidebarButton({
  icon: Icon,
  active,
  onClick,
}: {
  icon: any;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-12 h-12 rounded-xl transition-all duration-200 ${
        active
          ? "bg-dashboard-card text-white shadow-lg shadow-blue-900/20 scale-110"
          : "text-dashboard-muted hover:bg-dashboard-card hover:text-white"
      }`}
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
}
