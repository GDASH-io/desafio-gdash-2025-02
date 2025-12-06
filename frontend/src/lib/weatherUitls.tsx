import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Snowflake
} from "lucide-react";
import React from "react";

export interface WeatherInfo {
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const getWeatherInfo = (code: number, isDay: boolean = true): WeatherInfo => {

  let info: WeatherInfo = {
    description: "Desconhecido",
    icon: <Cloud className="h-16 w-16 md:h-20 md:w-20 text-slate-400 drop-shadow-lg" />,
    colorClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-500"
  };

  switch (code) {
    case 0:
      info = {
        description: "Céu Limpo",
        icon: isDay ?
          <Sun className="h-16 w-16 md:h-20 md:w-20 text-orange-500 drop-shadow-lg" /> :
          <Sun className="h-16 w-16 md:h-20 md:w-20 text-indigo-300 drop-shadow-lg" />,
        colorClass: "text-orange-700",
        bgClass: "bg-orange-50",
        borderClass: "border-orange-500"
      };
      break;
    case 1:
      info = {
        description: "Predominantemente Limpo",
        icon: <CloudSun className="h-16 w-16 md:h-20 md:w-20 text-amber-400 drop-shadow-lg" />,
        colorClass: "text-amber-700",
        bgClass: "bg-amber-50",
        borderClass: "border-amber-500"
      };
      break;
    case 2:
      info = {
        description: "Parcialmente Nublado",
        icon: <CloudSun className="h-16 w-16 md:h-20 md:w-20 text-amber-400 drop-shadow-lg" />,
        colorClass: "text-amber-700",
        bgClass: "bg-amber-50",
        borderClass: "border-amber-500"
      };
      break;
    case 3:
      info = {
        description: "Encoberto",
        icon: <Cloud className="h-16 w-16 md:h-20 md:w-20 text-slate-400 drop-shadow-lg" />,
        colorClass: "text-slate-700",
        bgClass: "bg-slate-50",
        borderClass: "border-slate-500"
      };
      break;
    case 45:
      info = {
        description: "Nevoeiro",
        icon: <CloudFog className="h-16 w-16 md:h-20 md:w-20 text-slate-400 drop-shadow-lg" />,
        colorClass: "text-slate-700",
        bgClass: "bg-slate-50",
        borderClass: "border-slate-500"
      };
      break;
    case 48:
      info = {
        description: "Nevoeiro com Geada",
        icon: <CloudFog className="h-16 w-16 md:h-20 md:w-20 text-slate-400 drop-shadow-lg" />,
        colorClass: "text-slate-700",
        bgClass: "bg-slate-50",
        borderClass: "border-slate-500"
      };
      break;
    case 51:
      info = {
        description: "Garoa Leve",
        icon: <CloudDrizzle className="h-16 w-16 md:h-20 md:w-20 text-blue-300 drop-shadow-lg" />,
        colorClass: "text-blue-600",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-400"
      };
      break;
    case 53:
      info = {
        description: "Garoa Moderada",
        icon: <CloudDrizzle className="h-16 w-16 md:h-20 md:w-20 text-blue-300 drop-shadow-lg" />,
        colorClass: "text-blue-600",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-400"
      };
      break;
    case 55:
      info = {
        description: "Garoa Densa",
        icon: <CloudDrizzle className="h-16 w-16 md:h-20 md:w-20 text-blue-300 drop-shadow-lg" />,
        colorClass: "text-blue-600",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-400"
      };
      break;
    case 56:
      info = {
        description: "Garoa Congelante Leve",
        icon: <CloudDrizzle className="h-16 w-16 md:h-20 md:w-20 text-cyan-300 drop-shadow-lg" />,
        colorClass: "text-cyan-600",
        bgClass: "bg-cyan-50",
        borderClass: "border-cyan-400"
      };
      break;
    case 57:
      info = {
        description: "Garoa Congelante Densa",
        icon: <CloudDrizzle className="h-16 w-16 md:h-20 md:w-20 text-cyan-300 drop-shadow-lg" />,
        colorClass: "text-cyan-600",
        bgClass: "bg-cyan-50",
        borderClass: "border-cyan-400"
      };
      break;
    case 61:
      info = {
        description: "Chuva Leve",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-400 drop-shadow-lg" />,
        colorClass: "text-blue-700",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-500"
      };
      break;
    case 63:
      info = {
        description: "Chuva Moderada",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-500 drop-shadow-lg" />,
        colorClass: "text-blue-700",
        bgClass: "bg-blue-100",
        borderClass: "border-blue-600"
      };
      break;
    case 65:
      info = {
        description: "Chuva Forte",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-600 drop-shadow-lg" />,
        colorClass: "text-blue-800",
        bgClass: "bg-blue-200",
        borderClass: "border-blue-700"
      };
      break;
    case 66:
      info = {
        description: "Chuva Congelante Leve",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-cyan-500 drop-shadow-lg" />,
        colorClass: "text-cyan-700",
        bgClass: "bg-cyan-100",
        borderClass: "border-cyan-600"
      };
      break;
    case 67:
      info = {
        description: "Chuva Congelante Forte",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-cyan-600 drop-shadow-lg" />,
        colorClass: "text-cyan-800",
        bgClass: "bg-cyan-200",
        borderClass: "border-cyan-700"
      };
      break;
    case 71:
      info = {
        description: "Neve Leve",
        icon: <CloudSnow className="h-16 w-16 md:h-20 md:w-20 text-cyan-200 drop-shadow-lg" />,
        colorClass: "text-cyan-700",
        bgClass: "bg-cyan-50",
        borderClass: "border-cyan-400"
      };
      break;
    case 73:
      info = {
        description: "Neve Moderada",
        icon: <CloudSnow className="h-16 w-16 md:h-20 md:w-20 text-cyan-200 drop-shadow-lg" />,
        colorClass: "text-cyan-700",
        bgClass: "bg-cyan-50",
        borderClass: "border-cyan-400"
      };
      break;
    case 75:
      info = {
        description: "Neve Forte",
        icon: <CloudSnow className="h-16 w-16 md:h-20 md:w-20 text-cyan-200 drop-shadow-lg" />,
        colorClass: "text-cyan-700",
        bgClass: "bg-cyan-50",
        borderClass: "border-cyan-400"
      };
      break;
    case 77:
      info = {
        description: "Granizo",
        icon: <Snowflake className="h-16 w-16 md:h-20 md:w-20 text-cyan-400 drop-shadow-lg" />,
        colorClass: "text-cyan-800",
        bgClass: "bg-cyan-100",
        borderClass: "border-cyan-500"
      };
      break;
    case 80:
      info = {
        description: "Pancadas de Chuva Leve",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-600 drop-shadow-lg" />,
        colorClass: "text-blue-800",
        bgClass: "bg-blue-200",
        borderClass: "border-blue-700"
      };
      break;
    case 81:
      info = {
        description: "Pancadas de Chuva Moderada",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-600 drop-shadow-lg" />,
        colorClass: "text-blue-800",
        bgClass: "bg-blue-200",
        borderClass: "border-blue-700"
      };
      break;
    case 82:
      info = {
        description: "Pancadas de Chuva Violenta",
        icon: <CloudRain className="h-16 w-16 md:h-20 md:w-20 text-blue-700 drop-shadow-lg" />,
        colorClass: "text-blue-900",
        bgClass: "bg-blue-300",
        borderClass: "border-blue-800"
      };
      break;
    case 85:
      info = {
        description: "Pancadas de Neve Leve",
        icon: <CloudSnow className="h-16 w-16 md:h-20 md:w-20 text-cyan-300 drop-shadow-lg" />,
        colorClass: "text-cyan-800",
        bgClass: "bg-cyan-100",
        borderClass: "border-cyan-500"
      };
      break;
    case 86:
      info = {
        description: "Pancadas de Neve Forte",
        icon: <CloudSnow className="h-16 w-16 md:h-20 md:w-20 text-cyan-300 drop-shadow-lg" />,
        colorClass: "text-cyan-800",
        bgClass: "bg-cyan-100",
        borderClass: "border-cyan-500"
      };
      break;
    case 95:
      info = {
        description: "Tempestade",
        icon: <CloudLightning className="h-16 w-16 md:h-20 md:w-20 text-purple-500 drop-shadow-lg" />,
        colorClass: "text-purple-800",
        bgClass: "bg-purple-100",
        borderClass: "border-purple-600"
      };
      break;
    case 96:
      info = {
        description: "Tempestade com Granizo Leve",
        icon: <CloudLightning className="h-16 w-16 md:h-20 md:w-20 text-purple-600 drop-shadow-lg" />,
        colorClass: "text-purple-900",
        bgClass: "bg-purple-200",
        borderClass: "border-purple-700"
      };
      break;
    case 99:
      info = {
        description: "Tempestade com Granizo Forte",
        icon: <CloudLightning className="h-16 w-16 md:h-20 md:w-20 text-purple-700 drop-shadow-lg" />,
        colorClass: "text-purple-950",
        bgClass: "bg-purple-300",
        borderClass: "border-purple-800"
      };
      break;
    default:
      break;
  }

  return info;
};