import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { WeatherLog } from "@/services/weather";
import { getWeatherIcon, getWeatherLabel } from "@/utils/weatherUtils";

interface WeatherTableProps {
  logs: WeatherLog[];
  exporting: boolean;
  onExport: (format: "csv" | "xlsx") => void;
}

export function WeatherTable({ logs, exporting, onExport }: WeatherTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Registros do Dia</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onExport("csv")}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => onExport("xlsx")}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Umidade</TableHead>
              <TableHead>Vento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {log.location.city || "São Paulo"}
                </TableCell>
                <TableCell>
                  {getWeatherIcon(log.current.weather_code)}{" "}
                  {getWeatherLabel(log.current.weather_code)}
                </TableCell>
                <TableCell>
                  {log.current.temperature.toFixed(1)}°C
                </TableCell>
                <TableCell>{log.current.humidity.toFixed(0)}%</TableCell>
                <TableCell>
                  {log.current.wind_speed.toFixed(1)} km/h
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

