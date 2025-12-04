import { useEffect, useState } from "react";
import WeatherCard from "../components/WeatherCard";
import WeatherTable from "../components/WaetherTable";
import InsightsCard from "../components/InsightsCard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/weather/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data));

    fetch("http://localhost:3000/api/weather/insights")
      .then((res) => res.json())
      .then((data) => setInsights(data));
  }, []);

  const latest = logs[0];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">🌦️ Dashboard de Clima</h1>

      {latest && (
        <div className="flex gap-4">
          <WeatherCard title="Temperatura" value={latest.temperature} unit="°C" />
          <WeatherCard title="Umidade" value={latest.humidity} unit="%" />
          <WeatherCard title="Vento" value={latest.wind_speed} unit="km/h" />
          <WeatherCard title="Condição" value={latest.condition} />
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={() => window.open("http://localhost:3000/api/weather/export.csv")}>
          Exportar CSV
        </Button>
        <Button onClick={() => window.open("http://localhost:3000/api/weather/export.xlsx")}>
          Exportar XLSX
        </Button>
      </div>

      <WeatherTable logs={logs} />

      {insights && (
        <InsightsCard
          title="Insights de IA"
          description={`Temperatura média: ${insights.avg_temperature.toFixed(1)} °C`}
        />
      )}
    </div>
  );
}
