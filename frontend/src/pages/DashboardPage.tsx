import { useEffect, useState } from "react";
import { api } from "../services/api";
import { WeatherLog, WeatherInsights } from "../types";

export function DashboardPage() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [logsRes, insightsRes] = await Promise.all([
        api.get("/api/weather/logs"),
        api.get("/api/weather/insights"),
      ]);

      const mappedLogs: WeatherLog[] = logsRes.data.map((item: any) => ({
        _id: item._id,
        timestamp: item.timestamp,
        city: item.city,
        temperature: item.temperature,
        humidity: item.humidity,
        windSpeed: item.wind_speed,
        condition: item.condition,
        rainProbability: item.rain_probability,
      }));

      setLogs(mappedLogs);
      setInsights(insightsRes.data);
    } catch (err: any) {
      setError("Erro ao carregar dados do clima");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const downloadWeather = async (type: "csv" | "xlsx") => {
    try {
      const response = await api.get(`/api/weather/export.${type}`, {
        responseType: type === "csv" ? "blob" : "arraybuffer",
      });

      const mime =
        type === "csv"
          ? "text/csv;charset=utf-8;"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mime });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = type === "csv" ? "weather.csv" : "weather.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar dados.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-sm text-slate-600">Carregando dados climáticos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const latestLog = logs[0];

  return (
    <div className="space-y-6">
      {/* Título e botões */}
      <div className="flex items-center justify-between">
      <img
        src="/assets/03_0026_Dashboard-Climático.png"
        alt="DASHBOARD"
        className="h-6 object-contain"
      />
   
        {/* Container/holder para os botões */}
        <div
          className="relative flex items-center justify-center gap-10 px-6 py-2"
          style={{
            backgroundImage: `url(/assets/03_0034_SMALL-BUT-copy.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            minWidth: "320px",
            minHeight: "54px",
          }}
        >
          <button
            onClick={loadData}
            className="hover:opacity-80 transition-opacity"
            style={{ width: "20px", height: "18px" }}
          >
            <img
              src="/assets/03_0016_UP{DATE.png"
              alt="Update"
              className="w-full h-full object-contain"
            />
          </button>

          <button
            onClick={() => downloadWeather("csv")}
            className="hover:opacity-80 transition-opacity"
            style={{ width: "27px", height: "28px" }}
          >
            <img
              src="/assets/03_0018_CSV.png"
              alt="CSV"
              className="w-full h-full object-contain"
            />
          </button>

          <button
            onClick={() => downloadWeather("xlsx")}
            className="hover:opacity-80 transition-opacity"
            style={{ width: "35px", height: "28px" }}
          >
            <img
              src="/assets/03_0001_XLSX.png"
              alt="XLSX"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      </div>

{/* 4 Cards principais */}
{latestLog && (
  <div className="grid grid-cols-4 gap-5">
    {/* TEMPERATURA */}
    <div
      className="p-5 flex flex-col justify-between"
      style={{
        backgroundImage: `url(/assets/03_0042_BOX-GRAY.png)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        minHeight: "140px",
      }}
    >
      {/* Header: Texto à esquerda, Ícone à direita */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 uppercase">
          Temperatura
        </span>
        <img
          src="/assets/03_0004_TERM.png"
          alt="Temperatura"
          className="h-8 w-8 object-contain"
        />
      </div>
      
      {/* Valor */}
      <p className="text-4xl font-bold text-slate-900">
        {latestLog.temperature.toFixed(1)}°C
      </p>
    </div>

    {/* UMIDADE */}
    <div
      className="p-5 flex flex-col justify-between"
      style={{
        backgroundImage: `url(/assets/03_0041_BOX-GRAY.png)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        minHeight: "140px",
      }}
    >
      {/* Header: Texto à esquerda, Ícone à direita */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 uppercase">
          Umidade
        </span>
        <img
          src="/assets/03_0005_GOTA.png"
          alt="Umidade"
          className="h-8 w-8 object-contain"
        />
      </div>
      
      {/* Valor */}
      <p className="text-4xl font-bold text-slate-900">
        {latestLog.humidity}%
      </p>
    </div>

    {/* VENTO */}
    <div
      className="p-5 flex flex-col justify-between"
      style={{
        backgroundImage: `url(/assets/03_0040_BOX-GRAY.png)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        minHeight: "140px",
      }}
    >
      {/* Header: Texto à esquerda, Ícone à direita */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 uppercase">
          Vento
        </span>
        <img
          src="/assets/03_0003_VENTO.png"
          alt="Vento"
          className="h-8 w-8 object-contain"
        />
      </div>
      
      {/* Valor */}
      <p className="text-4xl font-bold text-slate-900">
        {latestLog.windSpeed.toFixed(1)} km/h
      </p>
    </div>

    {/* CONDIÇÃO */}
    <div
      className="p-5 flex flex-col justify-between"
      style={{
        backgroundImage: `url(/assets/03_0039_BOX-GRAY.png)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        minHeight: "140px",
      }}
    >
      {/* Header: Texto à esquerda, Ícone à direita */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 uppercase">
          Condição
        </span>
        <img
          src="/assets/03_0006_CLOUD.png"
          alt="Condição"
          className="h-8 w-8 object-contain"
        />
      </div>
      
      {/* Valor */}
      <p className="text-2xl font-bold text-slate-900">
        {latestLog.condition}
      </p>
    </div>
  </div>
)}



      {/* Insights de IA */}
      {insights && (
        <div className="grid grid-cols-[1.5fr_1fr] gap-5">
          {/* Box de insights */}
          <div
            className="p-6 space-y-4"
            style={{
              backgroundImage: `url(/assets/03_0043_GRAY.png)`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              minHeight: "220px",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                INSIGHTS DE IA
              </h2>
              {insights.classification && (
                <span className="px-3 py-1 text-xs font-semibold bg-sky-100 text-sky-700 rounded-full">
                  Clima {insights.classification}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {insights.text}
            </p>

            {insights.trendText && (
              <p className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 inline-block">
                {insights.trendText}
              </p>
            )}

            {Array.isArray((insights as any).alerts) &&
              (insights as any).alerts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(insights as any).alerts.map((alert: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4"
              style={{
                backgroundImage: `url(/assets/03_0042_BOX-GRAY.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                minHeight: "100px",
              }}
            >
              <p className="text-xs text-slate-500 uppercase mb-2">
                TEMPERATURA MÉDIA (24H)
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {insights.avgTemp.toFixed(1)}°C
              </p>
            </div>

            <div
              className="p-4"
              style={{
                backgroundImage: `url(/assets/03_0041_BOX-GRAY.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                minHeight: "100px",
              }}
            >
              <p className="text-xs text-slate-500 uppercase mb-2">
                UMIDADE MÉDIA (24H)
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {insights.avgHum.toFixed(1)}%
              </p>
            </div>

            <div
              className="p-4"
              style={{
                backgroundImage: `url(/assets/03_0040_BOX-GRAY.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                minHeight: "100px",
              }}
            >
              <p className="text-xs text-slate-500 uppercase mb-2">
                VENTO MÉDIO (24H)
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {insights.avgWind.toFixed(1)} km/h
              </p>
            </div>

            <div
              className="p-4"
              style={{
                backgroundImage: `url(/assets/03_0039_BOX-GRAY.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                minHeight: "100px",
              }}
            >
              <p className="text-xs text-slate-500 uppercase mb-2">
                ÍNDICE DE CONFORTO
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {(insights as any).comfortScore}/100
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (insights as any).comfortScore ?? 0)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

{/* Tabela */}
<div
  className="p-6"
  style={{
    backgroundImage: `url(/assets/03_0043_GRAY.png)`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    minHeight: "450px",
  }}
>
  {/* Header da tabela */}
  <div
    className="grid grid-cols-6 gap-4 p-4 mb-3 rounded-lg"
    style={{
      backgroundImage: `url(/assets/03_0038_BARRA.png)`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      minHeight: "50px",
    }}
  >
    {/* DATA/HORA */}
    <div className="flex items-center">
      <img
        src="/assets/03_0015_DATA_HORA.png"
        alt="DATA/HORA"
        className="h-3 object-contain"
      />
    </div>

    {/* CIDADE */}
    <div className="flex items-center">
      <img
        src="/assets/03_0014_CIDADE.png"
        alt="CIDADE"
        className="h-3 object-contain"
      />
    </div>

    {/* TEMP */}
    <div className="flex items-center">
      <img
        src="/assets/03_0013_TEMP.png"
        alt="TEMP"
        className="h-3 object-contain"
      />
    </div>

    {/* UMIDADE */}
    <div className="flex items-center">
      <img
        src="/assets/03_0011_UMIDADE.png"
        alt="UMIDADE"
        className="h-3 object-contain"
      />
    </div>

    {/* VENTO */}
    <div className="flex items-center">
      <img
        src="/assets/03_0012_VENTO.png"
        alt="VENTO"
        className="h-3 object-contain"
      />
    </div>

    {/* CONDIÇÃO */}
    <div className="flex items-center">
      <img
        src="/assets/03_0010_CONDIÇÃO.png"
        alt="CONDIÇÃO"
        className="h-4 object-contain"
      />
    </div>
  </div>

  {/* Linhas */}
  <div className="space-y-2 max-h-96 overflow-y-auto">
    {logs.slice(0, 10).map((log, idx) => (
      <div
        key={log._id}
        className={`grid grid-cols-6 gap-4 p-4 rounded ${
          idx % 2 === 0 ? "bg-white/40" : "bg-white/20"
        }`}
      >
        <div className="text-sm text-slate-900">
          {new Date(log.timestamp).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="text-sm text-slate-900">{log.city}</div>
        <div className="text-sm text-slate-900">
          {log.temperature.toFixed(1)}°C
        </div>
        <div className="text-sm text-slate-900">{log.humidity}%</div>
        <div className="text-sm text-slate-900">
          {log.windSpeed.toFixed(1)} km/h
        </div>
        <div className="text-sm text-slate-900 font-semibold">
          {log.condition}
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
  );
}
