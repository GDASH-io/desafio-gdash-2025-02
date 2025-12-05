export interface IDailyTemperature {
  date: string;
  temp: number;
}

export interface TemperatureChartProps {
  data: IDailyTemperature[];
}
