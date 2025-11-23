import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Visão Geral
        </h1>
        <p className="text-sm text-dashboard-muted">
          Monitoramento em tempo real
        </p>
      </div>
      <div className="flex items-center gap-4 self-end md:self-auto">
        <div className="bg-dashboard-card px-4 py-2 rounded-2xl flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white">Admin User</span>
        </div>
      </div>
    </header>
  );
}
