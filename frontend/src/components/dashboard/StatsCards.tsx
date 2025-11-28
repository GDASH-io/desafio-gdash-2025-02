import { Wind, Droplets, Thermometer, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type WeatherLog } from "@/services/api";

interface StatsCardsProps {
  lastLog?: WeatherLog;
}

export function StatsCards({ lastLog }: StatsCardsProps) {
  const getValue = (val: number | undefined, unit: string) => 
    val !== undefined ? `${val.toFixed(1)}${unit}` : "--";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Temperatura
          </CardTitle>
          <Thermometer className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getValue(lastLog?.temperature, "°C")}</div>
          <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Umidade
          </CardTitle>
          <Droplets className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastLog ? `${lastLog.humidity.toFixed(0)}%` : "--"}</div>
          <p className="text-xs text-muted-foreground">Umidade relativa do ar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Vento
          </CardTitle>
          <Wind className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getValue(lastLog?.wind_speed, " km/h")}</div>
          <p className="text-xs text-muted-foreground">Velocidade do vento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Radiação
          </CardTitle>
          <Sun className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastLog ? `${lastLog.radiation.toFixed(0)} W/m²` : "--"}</div>
          <p className="text-xs text-muted-foreground">Índice UV Solar</p>
        </CardContent>
      </Card>
    </div>
  );
}