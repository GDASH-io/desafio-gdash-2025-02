import React from "react";
import { Sun, Cloud, Droplet, Moon, Zap, Snowflake } from "lucide-react";
import { WeatherType } from "../utils/weatherMapping";

export function MainWeatherCard({ data }: { data: any }) {
  const renderIcon = (condition: WeatherType) => {
    switch (condition) {
      case "sunny":
      case "clear":
        return <Sun className="w-20 h-20 text-yellow-400 animate-pulse" />;
      case "cloudy":
      case "partly_cloudy":
        return <Cloud className="w-20 h-20 text-gray-300 animate-bounce" />;
      case "rain":
      case "drizzle":
      case "rain_showers":
        return <Droplet className="w-20 h-20 text-blue-400 animate-bounce" />;
      case "thunderstorm":
      case "storm":
        return <Zap className="w-20 h-20 text-yellow-300 animate-ping" />;
      case "snow":
        return <Snowflake className="w-20 h-20 text-white animate-spin" />;
      case "night":
        return <Moon className="w-20 h-20 text-indigo-300 animate-pulse" />;
      case "fog":
        return <Cloud className="w-20 h-20 text-gray-400 animate-pulse" />;
      default:
        return <Sun className="w-20 h-20 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 flex-1 flex flex-col items-center shadow-2xl transform transition-transform duration-500 hover:-translate-y-2">
      <div className="transition-all duration-1000">{renderIcon(data.condition)}</div>
      <span className="text-7xl font-extrabold mt-4">{data.temperature}°C</span>
      <span className="text-2xl mt-1 capitalize">{data.sky_condition}</span>
    </div>
  );
}
