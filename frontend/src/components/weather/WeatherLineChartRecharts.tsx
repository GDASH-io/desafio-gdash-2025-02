import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import weatherService from "../../services/weatherService";
import type { WeatherLogPublic } from "../../services/weatherService";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  from?: string;
  to?: string;
  limit?: number;
}

export function WeatherLineChartRecharts({ from, to, limit = 50 }: Props) {
  const [data, setData] = useState<WeatherLogPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const resp = await weatherService.listLogs({ page: 1, limit, from, to });
        setData(resp.data ?? []);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar gráfico");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [from, to, limit]);

  // Exibir horário em UTC para manter o valor "bruto" armazenado sem aplicar deslocamento local
  const chartData = data.map(d => {
    const dateObj = new Date(d.timestamp);
    const dayStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(dateObj);
    const timeStr = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(dateObj);
    return {
      dt: `${dayStr} ${timeStr}`, // formato DD HH:mm (UTC)
      temperature: d.temperature2m,
      humidity: d.relativeHumidity2m,
      wind: d.windSpeed10m,
      precipitation: d.precipitation,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperatura (últimos registros)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-500">Carregando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && chartData.length > 0 && (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dt" tickMargin={8} tickFormatter={(v: string) => v} />
                {/* Eixo esquerdo: temperatura (°C) e umidade (%) */}
                <YAxis yAxisId="left" tickMargin={8} domain={["auto", "auto"]} />
                {/* Eixo direito: vento (km/h) e chuva (mm) */}
                <YAxis yAxisId="right" orientation="right" tickMargin={8} domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    switch (name) {
                      case 'temperature': return [`${value} °C`, 'Temperatura'];
                      case 'humidity': return [`${value} %`, 'Umidade'];
                      case 'wind': return [`${value} km/h`, 'Vento'];
                      case 'precipitation': return [`${value} mm`, 'Chuva'];
                      default: return [value, name];
                    }
                  }}
                  labelFormatter={(label: any) => `Registro: ${label}`}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperatura °C" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="left" type="monotone" dataKey="humidity" name="Umidade %" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="wind" name="Vento km/h" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="precipitation" name="Chuva mm" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && !error && chartData.length === 0 && (
          <div className="text-sm text-gray-500">Sem dados para o período.</div>
        )}
      </CardContent>
    </Card>
  );
}
