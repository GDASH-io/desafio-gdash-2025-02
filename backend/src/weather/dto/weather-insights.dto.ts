export class WeatherInsightsDto {
  summary: string;
  trend: 'up' | 'down' | 'stable';
  alert?: string;
  averageTemp: number;
}
