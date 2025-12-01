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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAZIL_CAPITALS } from "@/interfaces/brazil_capitals";

interface AppHeaderProps {
  selectedCity: string;
  onGenerateWeather: (city: string) => void;
  isGeneratingWeather?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  selectedCity,
  onGenerateWeather,
  isGeneratingWeather = false,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tempCity, setTempCity] = useState<string>(selectedCity || "Brasília");

  useEffect(() => {
    const currentUser = authService.getAuthUser() as User | null;
    setUser(currentUser);
  }, []);

  useEffect(() => {
    setTempCity(selectedCity || "Brasília");
  }, [selectedCity]);

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

  const handleApplyCity = () => {
    if (!tempCity) return;
    onGenerateWeather(tempCity);
  };

  const avatarUrl =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : user?.avatar
      ? `${API_BASE_URL}${user.avatar}`
      : undefined;

  return (
    <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-950">
      {/* Esquerda: logo + navegação + cidade */}
      <Dialog>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
           <span
              onClick={() => navigate("/home")}
              className="text-xl font-semibold text-slate-50 cursor-pointer hover:text-slate-300 transition"
            >
              Weather Dashboard
            </span>
            <span className="text-xs text-slate-400">
              Cidade atual:{" "}
              <span className="font-medium text-slate-100">
                {selectedCity || "Brasília"}
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
            {/* 🔹 Dropdown de Relatórios com subitem Star Wars */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-slate-50 transition-colors cursor-pointer">
                  Relatórios
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/star-wars")}
                >
                  Listar Star Wars
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 🔹 Gerar clima abre o modal */}
            <DialogTrigger asChild>
              <button className="hover:text-slate-50 transition-colors cursor-pointer">
                Gerar clima
              </button>
            </DialogTrigger>
          </nav>
        </div>

        {/* Modal de seleção de cidade */}
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Selecionar cidade</DialogTitle>
            <DialogDescription className="text-slate-400">
              Escolha a cidade para coletar o clima em tempo real e atualizar o
              gráfico, a tabela e os insights de IA.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <label className="text-sm text-slate-200">Cidade</label>
            <Select
              value={tempCity}
              onValueChange={(value: string) => setTempCity(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {BRAZIL_CAPITALS.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={handleApplyCity}
              disabled={isGeneratingWeather || !tempCity}
              className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-60"
            >
              {isGeneratingWeather
                ? "Gerando clima..."
                : "Aplicar e atualizar clima"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <DropdownMenuItem
            onClick={() => navigate("/home")}
            className="cursor-pointer"
          >
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
