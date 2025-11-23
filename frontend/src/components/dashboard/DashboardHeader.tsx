import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, type ReactNode } from "react";
import { getUserProfile, type UserProfile } from "../../services/api";

type DashboardHeaderProps = {
  title?: ReactNode;
  subtitle?: string;
};

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getUserProfile()
      .then((data) => setUser(data))
      .catch((error) => console.error("Erro ao carregar perfil", error));
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const safeName = user?.name || "User";

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        {title ? (
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Visão Geral
          </h1>
        )}

        <p className="text-sm text-dashboard-muted">
          {subtitle || "Monitoramento em tempo real"}
        </p>
      </div>

      <div className="flex items-center gap-4 self-end md:self-auto">
        <div className="bg-dashboard-card px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/5 shadow-sm hover:bg-white/5 transition-colors cursor-pointer">
          <div className="hidden md:flex flex-col items-end justify-center mr-1">
            <p className="text-sm font-bold text-white leading-tight capitalize">
              {user?.name || "Carregando..."}
            </p>
            <p className="text-xs text-dashboard-muted">
              {user?.email || "..."}
            </p>
          </div>

          <Avatar className="h-10 w-10 border-2 border-dashboard-highlight">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${safeName}&background=50E3C2&color=151C2F`}
            />
            <AvatarFallback className="bg-dashboard-highlight text-dashboard-card font-bold">
              {getInitials(safeName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
