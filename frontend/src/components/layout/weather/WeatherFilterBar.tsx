import { Button } from "@/components/ui/button";

interface WeatherFilterBarProps {
  days: number;
  isLoading: boolean;
  isExporting: boolean;
  onDaysChange: (days: number) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
}

export function WeatherFilterBar({
  days,
  isLoading,
  isExporting,
  onDaysChange,
  onExportCsv,
  onExportXlsx,
}: WeatherFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Painel de Controle do Clima</h2>
        <p className="text-sm text-slate-400">
          Dados reais e insights gerados por IA.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm cursor-pointer"
          value={days}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value={1}>Últimas 24h</option>
          <option value={3}>Últimos 3 dias</option>
          <option value={7}>Últimos 7 dias</option>
          <option value={14}>Últimos 14 dias</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting}
          className="cursor-pointer"
        >
          Exportar CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportXlsx}
          disabled={isExporting}
          className="cursor-pointer"
        >
          Exportar XLSX
        </Button>
      </div>
    </div>
  );
}
