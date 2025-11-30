import { Search, FilterX, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UsersFilterBarProps = {
  filters: {
    search: string;
    role: string;
    date: string;
  };
  hasActiveFilters: boolean;
  onFilterChange: (key: "search" | "role" | "date", value: string) => void;
  onClearFilters: () => void;
};

export function UsersFilterBar({
  filters,
  hasActiveFilters,
  onFilterChange,
  onClearFilters,
}: UsersFilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Busca por Texto */}
      <div className="flex-1 flex items-center gap-2 bg-white p-2 rounded-lg border border-zinc-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search className="h-4 w-4 text-zinc-400 ml-2" />
        <Input
          placeholder="Buscar por e-mail..."
          className="border-0 focus-visible:ring-0 shadow-none h-9"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      {/* Filtro de Role */}
      <div className="w-full lg:w-[200px]">
        <Select
          value={filters.role}
          onValueChange={(val) => onFilterChange("role", val)}
        >
          <SelectTrigger className="h-[46px] bg-white border-zinc-200 shadow-sm">
            <SelectValue placeholder="Todas as Permissões" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Permissões</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="user">Usuário Padrão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Data */}
      <div className="w-full lg:w-auto relative">
        <div className="absolute left-3 top-3.5 z-10 pointer-events-none text-zinc-500">
          <Calendar className="h-4 w-4" />
        </div>
        <Input
          type="date"
          className="h-[46px] pl-10 bg-white border-zinc-200 shadow-sm w-full lg:w-[180px]"
          value={filters.date}
          onChange={(e) => onFilterChange("date", e.target.value)}
        />
      </div>

      {/* Botão Limpar Filtros */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="h-[46px] text-zinc-500 hover:text-red-600 hover:bg-red-50 gap-2"
        >
          <FilterX className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
