export class InsightsResponseDto {
  summary: string;
  statistics: {
    averageTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    averageHumidity: number;
    averageWindSpeed: number;
    temperatureTrend: 'increasing' | 'decreasing' | 'stable';
    humidityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  comfortScore: number; // 0-100
  dayClassification: 'frio' | 'quente' | 'agradável' | 'chuvoso' | 'variável';
  alerts: Array<{
    type: 'rain' | 'heat' | 'cold' | 'wind' | 'humidity';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  periodAnalysis: {
    days: number;
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  recommendations: string[];
}
