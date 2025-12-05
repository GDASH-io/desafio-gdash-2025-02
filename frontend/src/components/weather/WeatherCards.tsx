import { WeatherLog } from "../../types";
import { ThermometerIcon, DropletIcon, WindIcon, CloudIcon } from "lucide-react";

interface Props {
  log?: WeatherLog; 
}

export function WeatherCards({ log }: Props) {
  if (!log) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Temperatura</span>
            <ThermometerIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-gray-400">--°C</div>
          <p className="text-xs text-gray-400 mt-1">Aguardando dados...</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Umidade</span>
            <DropletIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-400">--%</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Vento</span>
            <WindIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-400">-- km/h</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Condição</span>
            <CloudIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-400">--</div>
          <p className="text-xs text-gray-400 mt-1">Chuva: --%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Temperatura</span>
          <ThermometerIcon className="h-5 w-5 text-red-500" />
        </div>
        <div className="text-3xl font-bold text-gray-800">
          {log.temperature?.toFixed(1) ?? '--'}°C
        </div>
        <p className="text-xs text-gray-500 mt-1">{log.city || '--'}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Umidade</span>
          <DropletIcon className="h-5 w-5 text-blue-500" />
        </div>
        <div className="text-3xl font-bold text-gray-800">
          {log.humidity?.toFixed(1) ?? '--'}%
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Vento</span>
          <WindIcon className="h-5 w-5 text-green-500" />
        </div>
        <div className="text-3xl font-bold text-gray-800">
          {log.windSpeed?.toFixed(1) ?? '--'} km/h
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Condição</span>
          <CloudIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-800">
          {log.condition || '--'}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Chuva: {log.rainProbability?.toFixed(0) ?? '--'}%
        </p>
      </div>
    </div>
  );
}
