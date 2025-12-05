export type WeatherData = {
  cityName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  time: string;
  date: string;
  apparentTemperature: number;
  rain: number;
  isDay: number;
  dailyInfo: {
    days: string[];
    tempMin: number[];
    tempMax: number[];
    uvIndex: number[];
    solarRadiation: number[];
  };
};

export type IaData = {
  weatherAnalysis: string;
  concerningLevel: number;
  suggestedAction: string;
  radiationAnalysis: string;
}
