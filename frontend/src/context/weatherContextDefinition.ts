import { createContext } from "react";
import type { IWeatherContext } from "../interfaces/weather.interface";

export const WeatherContext = createContext<IWeatherContext | undefined>(
  undefined
);
