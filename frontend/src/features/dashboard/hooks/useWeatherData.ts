export type WeatherType = 
  | "sunny"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "night"
  | "rain_showers"
  | "clear"
  | "partly_cloudy"
  | "unknown";

export const weatherCodeMapping: Record<number, WeatherType> = {
    0: "clear",
    1: "partly_cloudy",
    2: "partly_cloudy",
    3: "partly_cloudy",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    56: "drizzle",
    57: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    66: "rain",
    67: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    77: "snow",
    80: "rain_showers",
    81: "rain_showers",
    82: "rain_showers",
    95: "thunderstorm",
    96: "thunderstorm",
    99: "thunderstorm",
};

export function mapWeatherCode(code: number): WeatherType {
    return weatherCodeMapping[code] ?? "unknown";
}
