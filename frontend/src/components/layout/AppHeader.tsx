import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound } from "lucide-react";

import { authService } from "@/services/authService";
import { API_BASE_URL } from "@/config/api";
import type { User } from "@/interfaces/auth";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getAuthUser() as User | null;
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao sair", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    }
  };

  const avatarUrl =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : user?.avatar
      ? `${API_BASE_URL}${user.avatar}`
      : undefined;

  return (
    <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-950">
      {/* Esquerda: logo + navegação */}
      <div className="flex items-center gap-6">
        <span className="text-xl font-semibold text-slate-50">
          Weather Dashboard
        </span>

        <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
          <button className="hover:text-slate-50 transition-colors">
            Início
          </button>
          <button className="hover:text-slate-50 transition-colors">
            Relatórios
          </button>
          <button className="hover:text-slate-50 transition-colors">
            Configurações
          </button>
        </nav>
      </div>

      {/* Direita: usuário + avatar + menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-3 rounded-full border border-slate-700
                       bg-slate-900 px-3 py-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-end mr-1">
              <span className="text-sm font-medium text-slate-100">
                {user?.username ?? "Usuário"}
              </span>
              {user?.email && (
                <span className="text-xs text-slate-400 max-w-[180px] truncate">
                  {user.email}
                </span>
              )}
            </div>

            <Avatar className="w-9 h-9">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user?.username} />
              ) : (
                <AvatarFallback className="bg-slate-700">
                  <UserRound className="w-4 h-4 text-slate-200" />
                </AvatarFallback>
              )}
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/home")}>
            Home
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            ID usuário: {user?.id ?? "—"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AppHeader;
