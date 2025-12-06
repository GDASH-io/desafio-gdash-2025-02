import { Card, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, ChevronsUpDown } from "lucide-react";
import { useTheme } from "./lib/theme";
import { useEffect, useState } from "react";
import { getWeatherInfo } from "./lib/weatherUitls";
import "./custon.css"
import { RequestWeatherNow, type DailyResponse, type WeatherNowResponse } from "./lib/client";

export default function Dashboard() {
  const { theme } = useTheme();
  const [weatherData, setWeatherData] = useState<WeatherNowResponse | null>(null);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [dailyInsightIndices, setDailyInsightIndices] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await RequestWeatherNow();
        if (!response) {
          return
        }

        setWeatherData(response);
        if (response.insights && response.insights.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.insights.length);
          setCurrentInsightIndex(randomIndex);
        }
        if (response.daily && response.daily.length > 0) {
          const indices = response.daily.map((day: DailyResponse) =>
            day.insights.length > 0 ? Math.floor(Math.random() * day.insights.length) : 0
          );
          setDailyInsightIndices(indices);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do clima:", error);
      }
    };

    fetchData();

  }, []);

  const handleDailyInsightChange = (dayIndex: number, insightsLength: number) => {
    setDailyInsightIndices(prev => {
      const newIndices = [...prev];
      newIndices[dayIndex] = (newIndices[dayIndex] + 1) % insightsLength;
      return newIndices;
    });
  };

  if (!weatherData) {
    return <div className="p-4">Carregando...</div>;
  }

  const weatherInfo = getWeatherInfo(weatherData.weatherCode);
  return (
    <div className={`flex flex-col lg:flex-row w-full h-full p-2 space-x-2`}>
      <div className="flex flex-col w-full lg:w-2/3 min-w-0 h-full min-h-0 space-y-2">
        <Card className={`lg:basis-2/3 w-full bg-black py-2 ${theme === 'dark'
          ? 'bg-linear-to-br from-blue-950/30 via-slate-900/50 to-zinc-900/80 border-zinc-800/50'
          : 'bg-linear-to-br from-blue-50 via-white to-slate-50 border-slate-200'}`}>
          <div className="flex flex-col lg:flex-row justify-between items-center px-4">
            <div>
              <CardTitle className={`text-5xl font-bold tracking-tight mb-2 ${theme === 'dark' ?
                'text-white' : 'text-slate-900'}`}>
                {weatherData.city}
              </CardTitle>
              <CardDescription className={`text-sm md:text-base flex items-center gap-2
              ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-600'}`}>
                {weatherData.date} • {weatherData.hour}
              </CardDescription>
            </div>
            <div className="flex flex-col items-center">
              {weatherInfo.icon}
              <Badge variant="outline" className={`text-xs mt-2 ${theme === 'dark'
                ? `${weatherInfo.borderClass}`
                : `${weatherInfo.borderClass} ${weatherInfo.colorClass} ${weatherInfo.bgClass}`
                }`}>
                {weatherInfo.description}
              </Badge>
            </div>
          </div>

          <div className="w-full h-full flex items-center px-4">
            <div className="w-full flex items-start">
              <div className="flex items-start space-x-2 mr-4">
                <span className={`text-6xl sm:text-7xl md:text-8xl leading-none font-bold tracking-tighter 
                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {weatherData.temperature}
                </span>
                <span className={`text-2xl sm:text-3xl md:text-4xl font-light mt-2 
                ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  °C
                </span>
              </div>
              <div>
                <div className={`flex items-center gap-2
                ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'}`}>
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <span className="text-sm lg:text-base">Sensação {weatherData.apparentTemperature}°C</span>
                </div>
                <div className="flex gap-4 text-sm lg:text-base">
                  <span className="text-red-400">↑ {weatherData.maxTemperature}°</span>
                  <span className="text-blue-400">↓ {weatherData.minTemperature}°</span>
                </div>
                <div className={`flex items-start gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <p className="text-xs lg:text-sm w-full mt-2 leading-relaxed break-normal flex-1 h-20 overflow-y-auto scroll-custon pr-1">
                    {weatherData.insights.length > 0 ? weatherData.insights[currentInsightIndex] : "Os insights ainda estao sendo gerados, aguarde..."}
                  </p>
                  {weatherData.insights.length > 1 && (
                    <button
                      onClick={() => setCurrentInsightIndex((prev) => (prev + 1) % weatherData.insights.length)}
                      className={`mt-2 p-1 rounded-md hover:bg-zinc-800/50 transition-colors
                        ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-600'}`}>
                      <ChevronsUpDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className={`lg:basis-1/3 w-full h-full shrink-0 py-2 px-2
          ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800/50' : 'bg-white border-slate-200'}`}>
          <h1 className="text-white">Próximas Horas</h1>
          <div className="flex items-center gap-2 overflow-x-auto w-full h-full scroll-custon">
            {weatherData.hourly.map((hour, index) => {
              const info = getWeatherInfo(hour.weatherCode);
              return (
                <div key={index} className={`flex flex-col items-center justify-center p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-100'}`}>
                  <span className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-600'}`}>
                    {hour.hour}
                  </span>
                  <div className="mb-2">
                    {info.icon}
                  </div>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {Math.round(hour.temperature)}°
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card className={`flex flex-col lg:w-1/3 h-full bg-amber-500 p-2 space-y-2 ${theme === 'dark'
        ? 'bg-zinc-900/50 border-zinc-800/50' : 'bg-white border-slate-200'}`}>
        <h1 className="text-white">Próximos Dias</h1>
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto scroll-custon px-4 scroll-custon">
          {weatherData.daily.map((day, index) => {
            const info = getWeatherInfo(day.weatherCode);
            const currentInsight = dailyInsightIndices[index] ?? 0;
            return (
              <div key={index} className={`w-full shrink-0 p-4 rounded-xl shadow-sm transition-all hover:shadow-md
                ${theme === 'dark' ? 'bg-zinc-800/60 border border-zinc-700/50' : 'bg-linear-to-br from-white to-slate-50 border border-slate-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-zinc-200' : 'text-slate-700'}`}>
                      {day.date}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {Math.round(day.maxTemperature)}°
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="scale-90">
                      {info.icon}
                    </div>
                    <Badge variant="outline" className={`text-xs px-2 ${theme === 'dark'
                      ? `${info.borderClass}`
                      : `${info.borderClass} ${info.colorClass} ${info.bgClass}`
                      }`}>
                      {info.description}
                    </Badge>
                  </div>
                </div>

                {day.insights && day.insights.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-zinc-700/50' : 'border-slate-200'}`}>
                    <div className="flex items-start gap-2">
                      <p className={`text-xs leading-relaxed flex-1 h-10 break-normal overflow-y-auto scroll-custon pr-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {day.insights[currentInsight]}
                      </p>
                      {day.insights.length > 1 && (
                        <button
                          onClick={() => handleDailyInsightChange(index, day.insights.length)}
                          className={`p-1.5 rounded-md transition-all hover:scale-110
                            ${theme === 'dark'
                              ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}>
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  )
}