import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { WeatherDataLog } from "@/types/weatherType";

interface Props {
  logs: WeatherDataLog[];
  isLoading: boolean;
}

export function LogsDataWeatherTable({ logs, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-48 border rounded-md bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">
          Buscando histórico climático...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead>Horário</TableHead>
            <TableHead>Temperatura</TableHead>
            <TableHead>Umidade</TableHead>
            <TableHead>Vento</TableHead>
            <TableHead className="text-right">Condição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell className="font-medium text-zinc-700">
                {/* Formata a data para o padrão local (ex: 24/11 14:30) */}
                {new Date(log.collected_at).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>
                <span className="font-bold text-indigo-600">
                  {log.temperature}°C
                </span>
              </TableCell>
              <TableCell>{log.humidity}%</TableCell>
              <TableCell>{log.wind_speed} km/h</TableCell>
              <TableCell className="text-right">
                {/* Badge para o código WMO (daria pra traduzir com um switch/case depois) */}
                <Badge variant="outline" className="bg-slate-100">
                  WMO {log.condition_code}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {/* Caso a lista esteja vazia */}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                Nenhum registro encontrado. O coletor Python está rodando?
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
