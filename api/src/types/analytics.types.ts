export type TemperatureAnalyticsByHourResult = {
  hour: string;
  temperature: number;
};

export type WindSpeedAnalyticsByHourResult = {
  hour: string;
  windSpeed: number;
};

export type ComparativeAnalyticsByHourResult = {
  hour: string;
  temperature: number;
  windSpeed: number;
};

export type TemperatureAnalyticsByDayResult = {
  date: string;
  temperature: number;
};

export type WindSpeedAnalyticsByDayResult = {
  date: string;
  windSpeed: number;
};

export type ComparativeAnalyticsByDayResult = {
  date: string;
  temperature: number;
  windSpeed: number;
};
