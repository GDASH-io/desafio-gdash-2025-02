import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import { ConfigService } from '@nestjs/config';

export interface InsightResult {
  timeRange: string;
  metrics: {
    averageTemperature: number;
    averageHumidity: number;
    averageWindSpeed: number;
    averageRainProbability: number;
    minTemperature: number;
    maxTemperature: number;
    trend: 'rising' | 'falling' | 'stable';
  };
  classification: string;
  comfortScore: number;
  summaryText: string;
  alerts: string[];
}

@Injectable()
export class InsightsService {
  constructor(
    private weatherService: WeatherService,
    private configService: ConfigService,
  ) {}

  async generateInsights(timeRange: '24h' | '7d' | '30d' = '24h', city?: string): Promise<InsightResult> {
    const aggregated = await this.weatherService.getAggregatedData(timeRange, city);

    if (!aggregated) {
      return {
        timeRange,
        metrics: {
          averageTemperature: 0,
          averageHumidity: 0,
          averageWindSpeed: 0,
          averageRainProbability: 0,
          minTemperature: 0,
          maxTemperature: 0,
          trend: 'stable',
        },
        classification: 'sem_dados',
        comfortScore: 0,
        summaryText: 'Não há dados suficientes para gerar insights.',
        alerts: [],
      };
    }

    // Calcular comfort score (0-100)
    // Baseado em temperatura ideal (20-26°C), umidade ideal (40-70%), vento moderado
    const tempScore = this.calculateTemperatureScore(aggregated.averageTemperature);
    const humidityScore = this.calculateHumidityScore(aggregated.averageHumidity);
    const windScore = this.calculateWindScore(aggregated.averageWindSpeed);
    const comfortScore = Math.round((tempScore + humidityScore + windScore) / 3);

    // Classificação do clima
    const classification = this.classifyWeather(
      aggregated.averageTemperature,
      aggregated.averageHumidity,
      aggregated.averageRainProbability,
    );

    // Gerar resumo em linguagem natural
    const summaryText = this.generateSummary(aggregated, classification, comfortScore);

    // Gerar alertas
    const alerts = this.generateAlerts(aggregated, classification);

    return {
      timeRange,
      metrics: {
        averageTemperature: Math.round(aggregated.averageTemperature * 10) / 10,
        averageHumidity: Math.round(aggregated.averageHumidity * 100) / 100,
        averageWindSpeed: Math.round(aggregated.averageWindSpeed * 10) / 10,
        averageRainProbability: Math.round(aggregated.averageRainProbability * 100) / 100,
        minTemperature: aggregated.minTemperature,
        maxTemperature: aggregated.maxTemperature,
        trend: aggregated.trend as 'rising' | 'falling' | 'stable',
      },
      classification,
      comfortScore,
      summaryText,
      alerts,
    };
  }

  private calculateTemperatureScore(temp: number): number {
    // Temperatura ideal: 20-26°C = 100 pontos
    if (temp >= 20 && temp <= 26) return 100;
    if (temp >= 18 && temp < 20) return 80 - (20 - temp) * 10;
    if (temp > 26 && temp <= 30) return 80 - (temp - 26) * 10;
    if (temp >= 15 && temp < 18) return 60 - (18 - temp) * 10;
    if (temp > 30 && temp <= 35) return 60 - (temp - 30) * 10;
    return Math.max(0, 40 - Math.abs(temp - 23) * 5);
  }

  private calculateHumidityScore(humidity: number): number {
    // Umidade ideal: 40-70% = 100 pontos
    if (humidity >= 0.4 && humidity <= 0.7) return 100;
    if (humidity >= 0.3 && humidity < 0.4) return 80 - (0.4 - humidity) * 200;
    if (humidity > 0.7 && humidity <= 0.8) return 80 - (humidity - 0.7) * 200;
    return Math.max(0, 60 - Math.abs(humidity - 0.55) * 200);
  }

  private calculateWindScore(windSpeed: number): number {
    // Vento ideal: 5-20 km/h = 100 pontos
    if (windSpeed >= 5 && windSpeed <= 20) return 100;
    if (windSpeed < 5) return 80 - (5 - windSpeed) * 10;
    if (windSpeed > 20 && windSpeed <= 30) return 80 - (windSpeed - 20) * 5;
    return Math.max(0, 50 - Math.abs(windSpeed - 12.5) * 3);
  }

  private classifyWeather(temp: number, humidity: number, rainProb: number): string {
    if (rainProb > 0.6) return 'chuvoso';
    if (temp < 15) return 'frio';
    if (temp > 30) return 'quente';
    if (temp >= 20 && temp <= 26 && humidity >= 0.4 && humidity <= 0.7) return 'agradavel';
    if (temp >= 18 && temp <= 28) return 'moderado';
    return 'variado';
  }

  private generateSummary(aggregated: any, classification: string, comfortScore: number): string {
    const cityText = aggregated.city !== 'all' ? ` em ${aggregated.city}` : '';
    const timeText =
      aggregated.timeRange === '24h'
        ? 'nas últimas 24 horas'
        : aggregated.timeRange === '7d'
          ? 'nos últimos 7 dias'
          : 'nos últimos 30 dias';

    const tempText = `temperatura média de ${aggregated.averageTemperature.toFixed(1)}°C`;
    const trendText =
      aggregated.trend === 'rising'
        ? 'com tendência de aumento'
        : aggregated.trend === 'falling'
          ? 'com tendência de queda'
          : 'com temperatura estável';

    const classificationText = {
      agradavel: 'clima agradável',
      moderado: 'clima moderado',
      quente: 'clima quente',
      frio: 'clima frio',
      chuvoso: 'período chuvoso',
      variado: 'clima variado',
    }[classification] || 'clima variado';

    return `No período analisado${cityText} ${timeText}, observamos ${tempText} ${trendText}, caracterizando um ${classificationText}. O índice de conforto está em ${comfortScore}/100.`;
  }

  private generateAlerts(aggregated: any, classification: string): string[] {
    const alerts: string[] = [];

    if (aggregated.averageTemperature > 32) {
      alerts.push('⚠️ Calor extremo - tome precauções com exposição ao sol');
    }
    if (aggregated.averageTemperature < 12) {
      alerts.push('❄️ Frio intenso - agasalhe-se adequadamente');
    }
    if (aggregated.averageRainProbability > 0.7) {
      alerts.push('🌧️ Alta probabilidade de chuva - leve guarda-chuva');
    }
    if (aggregated.averageHumidity > 0.85) {
      alerts.push('💧 Umidade muito alta - cuidado com mofo e desconforto');
    }
    if (aggregated.averageWindSpeed > 30) {
      alerts.push('💨 Ventos fortes - evite atividades ao ar livre');
    }
    if (aggregated.trend === 'rising' && aggregated.averageTemperature > 28) {
      alerts.push('📈 Temperatura em alta - prepare-se para dias mais quentes');
    }

    return alerts;
  }
}

