import React from "react";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiStrongWind,
  WiHumidity
} from "react-icons/wi";
import { formatDate } from "../utils";

interface WeatherCardProps {
  data: {
    timestamp: string;
    temperature: number;
    humidity: number;
    windspeed: number;
    condition?: string;
  };
}

export default function WeatherCard({ data }: WeatherCardProps) {
  const getConditionIcon = (condition?: string) => {
    if (!condition) return <WiDaySunny size={32} color="#FBBF24" />;

    const cond = condition.toLowerCase();
    if (cond.includes("rain")) return <WiRain size={32} color="#3B82F6" />;
    if (cond.includes("cloud")) return <WiCloud size={32} color="#9CA3AF" />;
    return <WiDaySunny size={32} color="#FBBF24" />;
  };

  return (
    <div className="p-5 bg-white shadow-lg rounded-xl flex flex-col gap-2 border border-gray-200">
      <div className="flex items-center gap-3">
        {getConditionIcon(data.condition)}
        <h3 className="text-lg font-semibold">{data.condition || "N/A"}</h3>
      </div>

      <p>
        <strong> Data:</strong>{" "}
        {formatDate(data.timestamp)}

      </p>

      <p className="flex items-center gap-2">
        <WiHumidity size={22} color="#3B82F6" /> <strong>Umidade:</strong>{" "}
        {data.humidity}%
      </p>

      <p className="flex items-center gap-2">
        <WiStrongWind size={22} color="#6B7280" /> <strong>Vento:</strong>{" "}
        {data.windspeed} km/h
      </p>

      <p className="text-xl font-bold text-blue-600">
        🌡 {data.temperature} °C
      </p>
    </div>
  );
}
