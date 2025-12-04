import React from "react";
import { WeatherLogFull } from "../types/weather";
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

export function ForecastCard({ day }: { day: WeatherLogFull }) {
  const date = new Date(day.time);

  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const weekday = weekdays[date.getDay()];
  const dayNumber = date.getDate();
  const month = months[date.getMonth()];

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col items-center shadow-lg w-full transition hover:bg-white/20">
      <span className="text-lg font-semibold text-white/90">
        {weekday}, {dayNumber} {month}
      </span>
      <div className="flex items-center gap-2 mt-4">
        <Thermometer className="w-7 h-7 text-white" />
        <span className="text-5xl font-extrabold">{day.temperature}°C</span>
      </div>
      <span className="capitalize text-lg text-white/90 mt-1 tracking-wide">
        {day.sky_condition}
      </span>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        
        <div className="flex flex-col items-center">
          <Droplets className="w-6 h-6 text-blue-300" />
          <span className="text-sm mt-1">{day.humidity}%</span>
          <span className="text-xs text-white/60">Humidity</span>
        </div>

        <div className="flex flex-col items-center">
          <Wind className="w-6 h-6 text-cyan-300" />
          <span className="text-sm mt-1">{day.wind_speed} km/h</span>
          <span className="text-xs text-white/60">Wind</span>
        </div>

        <div className="flex flex-col items-center">
          <CloudRain className="w-6 h-6 text-indigo-300" />
          <span className="text-sm mt-1">{day.rain_probability}%</span>
          <span className="text-xs text-white/60">Rain</span>
        </div>

      </div>
    </div>
  );
}
