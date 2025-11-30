import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Menu, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Para menu mobile (opcional)
import { authService } from "@/services/authService";
import { toast } from "sonner";

export function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
    toast.info("Sessão encerrada.");
  };

  // Itens do Menu de Navegação
  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Usuários", path: "/users", icon: Users },
    { label: "Star Wars", path: "/star-wars", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* --- CABEÇALHO GLOBAL --- */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Lado Esquerdo: Título e Logo (O que você pediu para manter) */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 hidden md:block">
              <LayoutDashboard className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 leading-none">
                Monitoramento Climático
              </h1>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                Painel de controle em tempo real via Python + Go
              </p>
            </div>
          </div>

          {/* Lado Direito: Menu Desktop e Logout */}
          <div className="flex items-center gap-4">
            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-lg mr-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-red-500 hover:bg-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>

            {/* Menu Mobile (Hamburguer) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg text-lg ${
                            isActive
                              ? "bg-indigo-50 text-indigo-600 font-bold"
                              : "text-zinc-600"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" /> {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO DA PÁGINA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
