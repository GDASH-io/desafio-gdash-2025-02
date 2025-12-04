import { Sun, Cloud, Droplet, Wind } from "lucide-react";

export function WeatherStats({ weather }: { weather: "snow" | "rain" }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col items-center bg-white/10 px-4 py-3 rounded-xl">
        <Sun className="w-8 h-8 text-yellow-300 mb-1" />
        <span className="text-white text-sm">22°C</span>
      </div>

      <div className="flex flex-col items-center bg-white/10 px-4 py-3 rounded-xl">
        <Cloud className="w-8 h-8 text-white mb-1" />
        <span className="text-white text-sm">
          {weather === "snow" ? "Snow" : "Rain"}
        </span>
      </div>

      <div className="flex flex-col items-center bg-white/10 px-4 py-3 rounded-xl">
        <Droplet className="w-8 h-8 text-blue-200 mb-1" />
        <span className="text-white text-sm">55%</span>
      </div>

      <div className="flex flex-col items-center bg-white/10 px-4 py-3 rounded-xl">
        <Wind className="w-8 h-8 text-blue-100 mb-1" />
        <span className="text-white text-sm">10 km/h</span>
      </div>
    </div>
  );
}
