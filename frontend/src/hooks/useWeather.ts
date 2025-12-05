import { useContext } from "react";
import type { IWeatherContext } from "../interfaces/weather.interface";
import { WeatherContext } from "../context/weatherContextDefinition";

export const useWeather = (): IWeatherContext => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};
