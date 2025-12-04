import React, { useEffect, useState } from "react";
import { MainWeatherCard } from "../components/MainWeatherCard";
import { SmallWeatherCard } from "../components/SmallWeatherCard";
import { Droplet, Wind, Thermometer, Cloud, Sun, Moon, AlertCircle, Umbrella } from "lucide-react";
import { mapWeatherCode, WeatherType } from "../hooks/useWeatherData";
import { getLogsToday } from "../../../services/weather-router/view-days";
import { getWeatherInsight } from "../../../services/weather-router/ia-view";

interface DayData {
  day: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure?: number;
  weatherCode: number;
  sky_condition: string;
  time: string;
  condition?: WeatherType;
  rain_probability?: number;
}

interface WeatherInsight {
  climaAtual?: any;
  alertas: string[];
  recomendacoes: string[];
  resumo: string;
}

export function DashboardPage() {
  const [data, setData] = useState<DayData[]>([]);
  const [insight, setInsight] = useState<WeatherInsight>({ alertas: [], recomendacoes: [], resumo: "" });
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => { 
    getLogsToday().then(d => {
      if (d?.length) setData(d.map((x:any)=>({ ...x, condition: mapWeatherCode(x.weatherCode) })));
    }); 
  }, []);

  useEffect(() => {
    async function fetchInsight() {
      if (!data.length) return;
      setLoadingInsight(true);
      try {
        const current = data[0];
        const forecast = data.slice(1, 4);
        const insightData = await getWeatherInsight(current, forecast, "Gere insights para o dashboard");

        setInsight({
          climaAtual: insightData?.climaAtual ?? {},
          alertas: Array.isArray(insightData?.alertas) ? insightData.alertas : [],
          recomendacoes: Array.isArray(insightData?.recomendacoes) ? insightData.recomendacoes : [],
          resumo: insightData?.resumo ?? "",
        });
      } catch (err) {
        console.error("Erro ao buscar insights da IA:", err);
        setInsight({ alertas: [], recomendacoes: [], resumo: "" });
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsight();
  }, [data]);

  if (!data.length) return <div className="text-white text-lg">Carregando dados do clima...</div>;

  const today = data[0];
  const hour = new Date(today.time).getHours();
  const timeOfDay = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Night";
  const comfort =
    today.temperature < 18 ? "Cold" :
    today.temperature < 25 ? "Comfortable" :
    "Hot";

  const climaAtual = insight.climaAtual || {};

  const getConditionIcon = () => {
    if (climaAtual.condicao?.includes("rain")) return <Umbrella className="w-10 h-10 text-blue-500"/>;
    if (climaAtual.condicao?.includes("cloud")) return <Cloud className="w-10 h-10 text-gray-400"/>;
    if (hour < 12) return <Sun className="w-10 h-10 text-yellow-400"/>;
    return <Moon className="w-10 h-10 text-gray-400"/>;
  };

  const cardBgColor = (condition: string) => {
    if (condition?.includes("rain")) return "bg-blue-600/40";
    if (condition?.includes("storm")) return "bg-red-600/60";
    if (condition?.includes("sun")) return "bg-yellow-500/40";
    return "bg-white/10";
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-4 sm:p-6 md:p-8 items-center overflow-y-auto bg-gradient-to-br from-blue-800 to-indigo-900 text-white">

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl pt-16 md:pt-0">
        <MainWeatherCard
          data={today}
          previousDays={data.slice(1,4)}
          className="shadow-xl rounded-2xl bg-gradient-to-br from-blue-600/70 to-indigo-700/70 backdrop-blur-md hover:scale-105 transition-transform duration-300 w-full md:w-2/5"
        />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 md:mt-0">
          <SmallWeatherCard title="Humidity" value={`${today.humidity}%`} icon={<Droplet className="w-10 h-10 text-blue-300 mb-2 animate-bounce"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
          <SmallWeatherCard title="Wind" value={`${today.wind_speed} km/h`} icon={<Wind className="w-10 h-10 text-blue-200 mb-2 animate-bounce"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
          <SmallWeatherCard title="Pressure" value={`${today.pressure ?? 1013} hPa`} icon={<Thermometer className="w-10 h-10 text-red-400 mb-2 animate-pulse"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
          <SmallWeatherCard title="Forecast" value={today.sky_condition} icon={<Cloud className="w-10 h-10 text-gray-400 mb-2 animate-bounce"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
          <SmallWeatherCard title="Time of Day" value={timeOfDay} icon={hour<12 ? <Sun className="w-10 h-10 text-yellow-400"/> : <Moon className="w-10 h-10 text-gray-400"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
          {today.rain_probability !== undefined && <SmallWeatherCard title="Rain Chance" value={`${today.rain_probability}%`} icon={<Droplet className="w-10 h-10 text-blue-500 animate-bounce"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>}
          <SmallWeatherCard title="Comfort" value={comfort} icon={<Thermometer className="w-10 h-10 text-orange-400"/>} className="bg-white/10 rounded-xl shadow-lg hover:bg-white/20 transition"/>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingInsight ? (
          <div className="text-white col-span-full text-center">Carregando insights da IA...</div>
        ) : (
          <>
            {insight.alertas.length > 0 && (
              <div className="p-4 rounded-xl shadow-lg" style={{ backgroundColor: cardBgColor(climaAtual.condicao) }}>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle/> Alertas</h3>
                <ul className="list-disc pl-5">
                  {insight.alertas.map((a,i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            {insight.recomendacoes.length > 0 && (
              <div className="bg-blue-600/40 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold mb-2">Recomendações</h3>
                <ul className="list-disc pl-5">
                  {insight.recomendacoes.map((r,i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {insight.resumo && (
              <div className="bg-green-600/40 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold mb-2">Resumo</h3>
                <p>{insight.resumo}</p>
              </div>
            )}
            {climaAtual && (
              <div className="bg-purple-600/40 p-4 rounded-xl shadow-lg col-span-full">
                <h3 className="font-semibold mb-2">Sugestões para Hoje</h3>
                <p>
                  {climaAtual.temperatura < 18 
                    ? "Está frio, considere agasalho e atividades internas." 
                    : climaAtual.temperatura < 25
                      ? "Temperatura agradável, ótimo para atividades ao ar livre."
                      : "Está quente, hidrate-se e evite exposição prolongada ao sol."}
                </p>
                {climaAtual.chanceDechuva > 50 && <p className="mt-2">Alerta: Possibilidade de chuva alta, leve guarda-chuva.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>

  );
}
