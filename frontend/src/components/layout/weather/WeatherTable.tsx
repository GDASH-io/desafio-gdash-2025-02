import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WeatherLog } from "@/interfaces/weather";
import { cn } from "@/lib/utils";

interface WeatherTableProps {
  logs: WeatherLog[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  selectedId?: number | null;
  onSelectLog?: (log: WeatherLog) => void;
}

// helper pra evitar erro de toFixed em undefined
function formatNumber(
  value: number | null | undefined,
  digits: number = 1
): string {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value.toFixed(digits);
  }
  return "-";
}

export function WeatherTable({
  logs,
  isLoading,
  page,
  pageSize,
  totalCount,
  onPrevPage,
  onNextPage,
  selectedId,
  onSelectLog,
}: WeatherTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Registros de clima
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableCaption>
            Últimos registros coletados pela pipeline de clima.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data/hora</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Temp (°C)</TableHead>
              <TableHead>Umidade (%)</TableHead>
              <TableHead>Pressão (hPa)</TableHead>
              <TableHead>Vento (m/s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const isSelected = selectedId === log.id;
              return (
                <TableRow
                  key={log.id}
                  onClick={() => onSelectLog?.(log)}
                  className={cn(
                    "cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60",
                    isSelected && "bg-slate-100 dark:bg-slate-800"
                  )}
                >
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{log.city ?? "-"}</TableCell>
                  <TableCell>{log.condition}</TableCell>
                  <TableCell>{formatNumber(log.temperature, 1)}</TableCell>
                  <TableCell>{formatNumber(log.humidity, 0)}</TableCell>
                  <TableCell>{formatNumber(log.pressure, 0)}</TableCell>
                  <TableCell>{formatNumber(log.wind_speed, 1)}</TableCell>
                </TableRow>
              );
            })}

            {!logs.length && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between text-sm text-slate-400">
          <span>
            {totalCount > 0
              ? `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  totalCount
                )} de ${totalCount}`
              : "Nenhum registro"}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={onPrevPage}
              className="cursor-pointer"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= totalCount || isLoading}
              onClick={onNextPage}
              className="cursor-pointer"
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
