import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WeatherLog,
  WeatherLogDocument,
} from '../weather/schemas/weather-log.schema';
import { InsightsResponseDto } from './dto/insights-response.dto';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class InsightsService {
  private gemini: GoogleGenAI | null = null;

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.gemini = new GoogleGenAI({ apiKey });
    }
  }

  async generateInsights(days: number = 7): Promise<InsightsResponseDto> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.weatherLogModel
      .find({
        timestamp: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        },
      })
      .sort({ timestamp: -1 })
      .limit(200)
      .exec();

    if (logs.length === 0) {
      return this.getEmptyInsights(days, startDate, endDate);
    }

    const stats = this.calculateStatistics(logs);
    const comfortScore = this.calculateComfortScore(stats);
    const dayClassification = this.classifyDay(stats);
    const alerts = this.generateAlerts(logs, stats);
    const recommendations = this.generateRecommendations(stats, alerts, logs);

    const summary = await this.generateSummary(logs, stats, days);

    return {
      summary,
      statistics: {
        averageTemperature: stats.avgTemperature,
        minTemperature: stats.minTemperature,
        maxTemperature: stats.maxTemperature,
        averageHumidity: stats.avgHumidity,
        averageWindSpeed: stats.avgWindSpeed,
        temperatureTrend: stats.temperatureTrend,
        humidityTrend: stats.humidityTrend,
      },
      comfortScore,
      dayClassification,
      alerts,
      periodAnalysis: {
        days,
        totalRecords: logs.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
      recommendations,
    };
  }

  private getEmptyInsights(
    days: number,
    startDate: Date,
    endDate: Date,
  ): InsightsResponseDto {
    return {
      summary:
        'Não há dados suficientes para gerar insights no período selecionado.',
      statistics: {
        averageTemperature: 0,
        minTemperature: 0,
        maxTemperature: 0,
        averageHumidity: 0,
        averageWindSpeed: 0,
        temperatureTrend: 'stable',
        humidityTrend: 'stable',
      },
      comfortScore: 50,
      dayClassification: 'variável',
      alerts: [],
      periodAnalysis: {
        days,
        totalRecords: 0,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
      recommendations: [
        'Aguarde mais dados para obter insights precisos.',
        'Verifique a previsão do tempo regularmente.',
        'Mantenha-se informado sobre as condições climáticas.',
      ],
    };
  }

  private calculateStatistics(logs: WeatherLogDocument[] | any[]) {
    const temperatures = logs.map((log) => log.current.temperature);
    const humidities = logs.map((log) => log.current.humidity);
    const windSpeeds = logs.map((log) => log.current.wind_speed);

    return {
      avgTemperature:
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      avgWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
      totalRecords: logs.length,
      temperatureTrend: this.calculateTrend(temperatures),
      humidityTrend: this.calculateTrend(humidities),
    };
  }

  private calculateTrend(
    values: number[],
  ): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const threshold = values.length > 10 ? 1 : 0.5;
    if (Math.abs(diff) < threshold) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  private calculateComfortScore(stats: any): number {
    let score = 100;
    const temp = stats.avgTemperature;

    if (temp < 10) {
      score -= 40;
    } else if (temp < 15) {
      score -= 20;
    } else if (temp >= 15 && temp <= 26) {
    } else if (temp <= 30) {
      score -= 15;
    } else if (temp <= 35) {
      score -= 30;
    } else {
      score -= 50;
    }

    const humidity = stats.avgHumidity;
    if (humidity < 30 || humidity > 70) {
      score -= 15;
    } else if (humidity < 40 || humidity > 60) {
      score -= 5;
    }

    if (stats.avgWindSpeed > 25) {
      score -= 10;
    } else if (stats.avgWindSpeed > 15) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private classifyDay(
    stats: any,
  ): 'frio' | 'quente' | 'agradável' | 'chuvoso' | 'variável' {
    const temp = stats.avgTemperature;
    const humidity = stats.avgHumidity;

    if (humidity > 80 && temp >= 15 && temp <= 28) {
      return 'chuvoso';
    }

    if (temp < 15) {
      return 'frio';
    } else if (temp > 30) {
      return 'quente';
    } else if (temp >= 20 && temp <= 26 && humidity >= 40 && humidity <= 60) {
      return 'agradável';
    }

    const tempRange = stats.maxTemperature - stats.minTemperature;
    if (tempRange > 8) {
      return 'variável';
    }

    return temp < 20 ? 'frio' : 'quente';
  }

  private generateAlerts(
    logs: WeatherLogDocument[] | any[],
    stats: any,
  ): Array<{
    type: 'rain' | 'heat' | 'cold' | 'wind' | 'humidity';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }> {
    const alerts: Array<{
      type: 'rain' | 'heat' | 'cold' | 'wind' | 'humidity';
      severity: 'low' | 'medium' | 'high';
      message: string;
    }> = [];

    if (stats.maxTemperature > 35) {
      alerts.push({
        type: 'heat',
        severity: 'high',
        message: `⚠️ Calor extremo detectado! Temperatura máxima de ${stats.maxTemperature.toFixed(1)}°C. Mantenha-se hidratado e evite exposição prolongada ao sol.`,
      });
    } else if (stats.maxTemperature > 30) {
      alerts.push({
        type: 'heat',
        severity: 'medium',
        message: `🌡️ Temperaturas elevadas (até ${stats.maxTemperature.toFixed(1)}°C). Tome precauções contra o calor.`,
      });
    }

    if (stats.minTemperature < 5) {
      alerts.push({
        type: 'cold',
        severity: 'high',
        message: `❄️ Frio intenso! Temperatura mínima de ${stats.minTemperature.toFixed(1)}°C. Proteja-se adequadamente.`,
      });
    } else if (stats.minTemperature < 10) {
      alerts.push({
        type: 'cold',
        severity: 'medium',
        message: `🧊 Temperaturas baixas (mínima de ${stats.minTemperature.toFixed(1)}°C). Vista-se adequadamente.`,
      });
    }

    const highHumidityLogs = logs.filter((log) => log.current.humidity > 80);
    if (highHumidityLogs.length > logs.length * 0.5) {
      const hasPrecipitation = logs.some((log) =>
        log.forecast?.hourly?.some(
          (h) =>
            h.precipitation_probability && h.precipitation_probability > 60,
        ),
      );

      if (hasPrecipitation) {
        alerts.push({
          type: 'rain',
          severity: 'high',
          message:
            '🌧️ Alta probabilidade de chuva detectada. Prepare-se para condições chuvosas.',
        });
      } else if (stats.avgHumidity > 85) {
        alerts.push({
          type: 'rain',
          severity: 'medium',
          message: '☁️ Umidade muito alta. Possibilidade de chuva aumentada.',
        });
      }
    }

    if (stats.avgWindSpeed > 30) {
      alerts.push({
        type: 'wind',
        severity: 'high',
        message: `💨 Ventos fortes (média de ${stats.avgWindSpeed.toFixed(1)} km/h). Tome cuidado ao ar livre.`,
      });
    } else if (stats.avgWindSpeed > 20) {
      alerts.push({
        type: 'wind',
        severity: 'medium',
        message: `🌬️ Ventos moderados a fortes (${stats.avgWindSpeed.toFixed(1)} km/h).`,
      });
    }

    if (stats.avgHumidity > 90) {
      alerts.push({
        type: 'humidity',
        severity: 'high',
        message: '💧 Umidade extremamente alta. Condições muito úmidas.',
      });
    } else if (stats.avgHumidity < 20) {
      alerts.push({
        type: 'humidity',
        severity: 'medium',
        message: '🏜️ Umidade muito baixa. Condições muito secas.',
      });
    }

    return alerts;
  }

  private generateRecommendations(
    stats: any,
    alerts: any[],
    logs: WeatherLogDocument[] | any[],
  ): string[] {
    const recommendations: string[] = [];

    if (!logs || logs.length === 0) {
      return [
        'Aguarde mais dados para obter recomendações precisos.',
        'Verifique a previsão do tempo regularmente.',
        'Mantenha-se informado sobre as condições climáticas.',
      ];
    }

    const latestLog = logs[0];
    const currentTemp = latestLog?.current?.temperature || stats.avgTemperature;
    const currentHumidity = latestLog?.current?.humidity || stats.avgHumidity;
    const currentWeatherCode = latestLog?.current?.weather_code || 0;
    const precipitationProb =
      latestLog?.forecast?.hourly?.[0]?.precipitation_probability || 0;

    console.log('Gerando recomendações com:', {
      currentTemp,
      currentHumidity,
      currentWeatherCode,
      precipitationProb,
      hasForecast: !!latestLog?.forecast?.hourly,
    });

    const isSunny = currentWeatherCode === 0 || currentWeatherCode <= 3;
    const isRainy = currentWeatherCode >= 45 && currentWeatherCode <= 82;
    const isCloudy = currentWeatherCode >= 4 && currentWeatherCode <= 48;

    if (
      isSunny &&
      currentTemp >= 18 &&
      currentTemp <= 28 &&
      precipitationProb < 30
    ) {
      recommendations.push(
        'Aproveite o dia ensolarado para atividades ao ar livre, como caminhadas, piqueniques ou esportes.',
      );
    } else if (isRainy || precipitationProb > 50) {
      recommendations.push(
        'Evite atividades ao ar livre devido à alta probabilidade de chuva. Se precisar sair, leve guarda-chuva.',
      );
    } else if (isCloudy && currentTemp >= 15 && currentTemp <= 25) {
      recommendations.push(
        'O dia está nublado, mas as condições são favoráveis para atividades ao ar livre com roupas adequadas.',
      );
    } else if (currentTemp < 15) {
      recommendations.push(
        'As temperaturas estão baixas. Vista-se adequadamente com roupas quentes antes de sair.',
      );
    } else if (currentTemp > 28) {
      recommendations.push(
        'As temperaturas estão elevadas. Evite atividades ao ar livre nos horários mais quentes do dia.',
      );
    } else {
      recommendations.push(
        'Aproveite o dia para atividades ao ar livre, considerando as condições climáticas atuais.',
      );
    }

    if (currentTemp > 25 || (currentTemp > 20 && currentHumidity < 50)) {
      recommendations.push(
        'Mantenha-se hidratado, mesmo com umidade moderada, para evitar desidratação durante atividades físicas.',
      );
    } else if (currentHumidity > 70) {
      recommendations.push(
        'A umidade está alta. Evite esforços físicos intensos e mantenha-se em ambientes bem ventilados.',
      );
    } else if (currentHumidity < 40) {
      recommendations.push(
        'A umidade está baixa. Hidrate-se regularmente e considere usar umidificador em ambientes fechados.',
      );
    } else {
      recommendations.push(
        'Mantenha-se hidratado ao longo do dia, especialmente se realizar atividades físicas.',
      );
    }

    if (isSunny && currentTemp >= 18) {
      recommendations.push(
        'Use protetor solar para se proteger dos raios UV, especialmente em um dia ensolarado.',
      );
    } else if (isRainy || precipitationProb > 50) {
      recommendations.push(
        'Prepare-se para condições chuvosas. Use roupas impermeáveis e calçados adequados.',
      );
    } else if (currentTemp < 10) {
      recommendations.push(
        'Proteja-se do frio com roupas adequadas, especialmente nas extremidades do corpo.',
      );
    } else if (stats.avgWindSpeed > 20) {
      recommendations.push(
        'Os ventos estão fortes. Tome cuidado ao ar livre e evite atividades em áreas expostas.',
      );
    } else {
      recommendations.push(
        'Verifique a previsão do tempo regularmente para planejar suas atividades ao ar livre.',
      );
    }

    while (recommendations.length < 3) {
      if (recommendations.length === 0) {
        recommendations.push(
          'Aproveite o dia para atividades ao ar livre, considerando as condições climáticas atuais.',
        );
      } else if (recommendations.length === 1) {
        recommendations.push(
          'Mantenha-se hidratado ao longo do dia, especialmente se realizar atividades físicas.',
        );
      } else {
        recommendations.push(
          'Verifique a previsão do tempo regularmente para planejar suas atividades ao ar livre.',
        );
      }
    }

    const finalRecommendations = recommendations.slice(0, 3);
    console.log(
      `Recomendações geradas: ${finalRecommendations.length}`,
      finalRecommendations,
    );
    return finalRecommendations;
  }

  private async generateSummary(
    logs: WeatherLogDocument[] | any[],
    stats: any,
    days: number,
  ): Promise<string> {
    if (this.gemini !== null) {
      try {
        return await this.generateAISummary(logs, stats, days);
      } catch (error) {
        console.error('Erro ao gerar resumo com IA:', error);
      }
    }

    return this.generateRuleBasedSummary(logs, stats, days);
  }

  private async generateAISummary(
    logs: WeatherLogDocument[] | any[],
    stats: any,
    days: number,
  ): Promise<string> {
    const latestLog = logs[0];
    const currentTemp = latestLog?.current?.temperature || stats.avgTemperature;
    const currentHumidity = latestLog?.current?.humidity || stats.avgHumidity;
    const currentWeatherCode = latestLog?.current?.weather_code || 0;
    const precipitationProb =
      latestLog?.forecast?.hourly?.[0]?.precipitation_probability || 0;

    const getSkyDescription = (code: number) => {
      if (code === 0) return 'ensolarado';
      if (code <= 3) return 'parcialmente nublado';
      if (code <= 48) return 'nublado';
      if (code <= 67 || code <= 82) return 'chuvoso';
      if (code <= 86) return 'nevando';
      return 'com neblina';
    };

    const skyDescription = getSkyDescription(currentWeatherCode);

    const prompt = `
Você é um especialista em meteorologia. Gere um resumo descritivo EXATAMENTE no formato abaixo.

Dados atuais:
- Temperatura: ${currentTemp.toFixed(1)}°C
- Umidade relativa: ${currentHumidity.toFixed(0)}%
- Condição do céu: ${skyDescription}
- Probabilidade de chuva: ${precipitationProb.toFixed(0)}%

FORMATO OBRIGATÓRIO (siga EXATAMENTE esta estrutura):
"As condições climáticas apresentam uma temperatura [DESCRIÇÃO] de [TEMPERATURA]°C com umidade relativa de [UMIDADE]%. O céu está [CONDIÇÃO_DO_CÉU] e a probabilidade de chuva é de [PROBABILIDADE]%, o que indica [DESCRIÇÃO_DO_DIA]."

Onde:
- [DESCRIÇÃO] = use palavras como: agradável, quente, fria, amena, muito quente (baseado na temperatura)
- [TEMPERATURA] = ${currentTemp.toFixed(1)}
- [UMIDADE] = ${currentHumidity.toFixed(0)}
- [CONDIÇÃO_DO_CÉU] = ${skyDescription}
- [PROBABILIDADE] = ${precipitationProb.toFixed(0)}
- [DESCRIÇÃO_DO_DIA] = descreva o que a probabilidade de chuva indica (ex: "um dia seco e favorável para atividades ao ar livre" se for 0%, ou "um dia com possibilidade de chuva" se for maior)

IMPORTANTE:
- Use EXATAMENTE o formato acima
- Comece sempre com "As condições climáticas apresentam"
- Use a temperatura ${currentTemp.toFixed(1)}°C
- Use a umidade ${currentHumidity.toFixed(0)}%
- Use a condição do céu: ${skyDescription}
- Use a probabilidade de chuva: ${precipitationProb.toFixed(0)}%
- Termine com "o que indica [descrição do dia]"
- Seja natural e descritivo
- Responda APENAS com o texto do resumo, sem aspas, sem explicações, sem listas, sem títulos
`;

    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    return text || this.generateRuleBasedSummary(logs, stats, days);
  }

  private generateRuleBasedSummary(
    logs: WeatherLogDocument[] | any[],
    stats: any,
    days: number,
  ): string {
    const parts: string[] = [];

    parts.push(
      `Nos últimos ${days} dias, a temperatura média foi de ${stats.avgTemperature.toFixed(1)}°C`,
    );

    const tempRange = stats.maxTemperature - stats.minTemperature;
    if (tempRange > 10) {
      parts.push(
        `com grande variação entre ${stats.minTemperature.toFixed(1)}°C e ${stats.maxTemperature.toFixed(1)}°C`,
      );
    } else {
      parts.push(
        `variando entre ${stats.minTemperature.toFixed(1)}°C e ${stats.maxTemperature.toFixed(1)}°C`,
      );
    }

    parts.push(`e umidade relativa média de ${stats.avgHumidity.toFixed(0)}%`);

    if (stats.temperatureTrend === 'increasing') {
      parts.push('com tendência de aumento de temperatura');
    } else if (stats.temperatureTrend === 'decreasing') {
      parts.push('com tendência de diminuição de temperatura');
    }

    if (stats.avgWindSpeed > 15) {
      parts.push(
        `e ventos moderados a fortes (média de ${stats.avgWindSpeed.toFixed(1)} km/h)`,
      );
    }

    return parts.join(', ') + '.';
  }
}
