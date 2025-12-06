import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

interface DashboardHeaderProps {
  location: string;
  isRefreshing: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportXLSX: () => void;
}

export function DashboardHeader({
  location,
  isRefreshing,
  isExporting,
  onRefresh,
  onExportCSV,
  onExportXLSX,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Climático</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real - {location}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
        <Button variant="outline" onClick={onExportCSV} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button variant="outline" onClick={onExportXLSX} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          XLSX
        </Button>
      </div>
    </div>
  );
}
