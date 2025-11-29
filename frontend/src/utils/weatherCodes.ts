import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog } from "lucide-react";

export const getWeatherCondition = (code: number) => {
  if (code === 0) return { label: "Céu Limpo", icon: Sun, color: "text-yellow-500" };
  if (code >= 1 && code <= 3) return { label: "Parcialmente Nublado", icon: Cloud, color: "text-gray-400" };
  if (code >= 45 && code <= 48) return { label: "Nevoeiro", icon: CloudFog, color: "text-slate-400" };
  if (code >= 51 && code <= 67) return { label: "Chuva Leve", icon: CloudRain, color: "text-blue-400" };
  if (code >= 71 && code <= 77) return { label: "Neve", icon: Snowflake, color: "text-cyan-200" };
  if (code >= 80 && code <= 82) return { label: "Chuva Forte", icon: CloudRain, color: "text-blue-600" };
  if (code >= 95) return { label: "Tempestade", icon: CloudLightning, color: "text-purple-500" };
  
  return { label: "Nublado", icon: Cloud, color: "text-gray-400" };
};