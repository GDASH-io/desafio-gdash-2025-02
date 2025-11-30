import { RefreshCw, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  onRefresh: () => void;
  onExport: (format: "csv" | "xlsx") => void;
  isGlobalLoading: boolean;
};

export function DashboardHeader({
  onRefresh,
  onExport,
  isGlobalLoading,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-200 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-800">Visão Geral</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Métricas e insights das últimas 24 horas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isGlobalLoading}
          className="w-full md:w-auto bg-white hover:bg-zinc-50"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isGlobalLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>

        <div className="hidden md:block h-8 w-px bg-zinc-200 mx-2" />

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport("csv")}
            className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
          >
            <FileDown className="mr-2 h-4 w-4 text-green-600" /> CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport("xlsx")}
            className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
          >
            <FileDown className="mr-2 h-4 w-4 text-green-600" /> XLSX
          </Button>
        </div>
      </div>
    </div>
  );
}
