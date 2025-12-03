import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExportXLSX } from "@/hooks/useGetExportXLSX";
import { getRainProbability } from "@/utils/rainProbability";
import type { WeatherHistoryPoint } from "@/utils/weatherHistory";

import { MapPin } from "lucide-react";

interface WeatherTableProps {
  data: WeatherHistoryPoint[];
}

export const WeatherTable = ({ data }: WeatherTableProps) => {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const { mutate: downloadXLSX, isPending } = useExportXLSX();
  const formatLocation = (lat: number, lon: number) => {
    return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
  };
  const MAX_ITEMS = 30;
  return (
    <Card className="backdrop-blur-sm bg-card/95 border border-border/50 shadow-card hover:shadow-lg hover:border-amber-300 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Histórico de Registros
        </CardTitle>

        <div className="flex justify-end">
          <Button onClick={() => downloadXLSX()}>
            {isPending ? "Gerando arquivo..." : "Exportar XLSX"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground py-5">
                  Data/Hora
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Local
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Condição
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Temperatura
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Umidade
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.slice(0, MAX_ITEMS).map((record, index) => (
                <TableRow
                  key={index}
                  className="transition-colors duration-200 hover:bg-amber-100 hover:text-amber-900"
                >
                  <TableCell className="font-medium py-5">
                    {formatDateTime(record.createdAt)}
                  </TableCell>

                  <TableCell>
                    {formatLocation(record.lat, record.lon)}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {(() => {
                        const rain = getRainProbability(
                          record.raw?.current_weather?.weathercode ?? 0
                        );

                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {rain.description}
                          </span>
                        );
                      })()}
                    </span>
                  </TableCell>

                  <TableCell>{record.temperatureC.toFixed(1)}°C</TableCell>

                  <TableCell>
                    {record.humidity ? record.humidity.toFixed(0) : "0"}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
