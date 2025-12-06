import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "@/services/auth";

interface DashboardHeaderProps {
  userName?: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const location = useLocation();
  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/explorar", label: "Explorar" },
    { path: "/usuarios", label: "Meu perfil" },
  ];

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Weather Dashboard
          </h1>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? "default" : "ghost"
                  }
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop User Info */}
          <span className="hidden md:block text-sm text-gray-600">
            Olá, {userName || "Usuário"}
          </span>
          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="hidden md:flex"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>

          {/* Mobile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Olá, {userName || "Usuário"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  asChild
                  className={
                    location.pathname === item.path
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  <Link to={item.path} className="w-full">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
