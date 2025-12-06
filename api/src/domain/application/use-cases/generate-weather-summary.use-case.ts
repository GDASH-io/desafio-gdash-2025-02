import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";
import Groq from "groq-sdk";
import {
  WeatherStatistics,
  CalculateWeatherStatisticsUseCase,
} from "./calculate-weather-statistics.use-case";
import {
  WeatherTrend,
  DetectWeatherTrendsUseCase,
} from "./detect-weather-trends.use-case";
import {
  WeatherAlert,
  GenerateWeatherAlertsUseCase,
} from "./generate-weather-alerts.use-case";

export interface GenerateWeatherSummaryRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  days?: number;
}

export interface WeatherSummaryResponse {
  summary: string;
  statistics: WeatherStatistics;
  trends: WeatherTrend[];
  alerts: WeatherAlert[];
  generatedAt: Date;
}

@Injectable()
export class GenerateWeatherSummaryUseCase {
  private groq: Groq;

  constructor(
    private weatherLogRepository: WeatherLogRepository,
    private calculateStatistics: CalculateWeatherStatisticsUseCase,
    private detectTrends: DetectWeatherTrendsUseCase,
    private generateAlerts: GenerateWeatherAlertsUseCase
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
    });
  }

  async execute(
    request: GenerateWeatherSummaryRequest
  ): Promise<Either<null, WeatherSummaryResponse>> {
    let { startDate, endDate } = request;

    if (request.days && !startDate) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - request.days);
    }

    const [statisticsResult, trendsResult, alertsResult] = await Promise.all([
      this.calculateStatistics.execute({
        startDate,
        endDate,
        location: request.location,
      }),
      this.detectTrends.execute({
        startDate,
        endDate,
        location: request.location,
      }),
      this.generateAlerts.execute({
        startDate,
        endDate,
        location: request.location,
      }),
    ]);

    if (
      statisticsResult.isLeft() ||
      trendsResult.isLeft() ||
      alertsResult.isLeft()
    ) {
      return right({
        summary: "Erro ao gerar análises.",
        statistics: {} as WeatherStatistics,
        trends: [],
        alerts: [],
        generatedAt: new Date(),
      });
    }

    const statistics = statisticsResult.value.statistics;
    const trends = trendsResult.value.trends;
    const alerts = alertsResult.value.alerts;

    const summary = await this.generateSummaryWithAI(
      statistics,
      trends,
      alerts,
      request.location,
      request.days
    );

    return right({
      summary,
      statistics,
      trends,
      alerts,
      generatedAt: new Date(),
    });
  }

  private async generateSummaryWithAI(
    statistics: WeatherStatistics,
    trends: WeatherTrend[],
    alerts: WeatherAlert[],
    location?: string,
    days?: number
  ): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      return this.generateFallbackSummary(
        statistics,
        trends,
        alerts,
        location,
        days
      );
    }

    try {
      const prompt = this.buildPrompt(
        statistics,
        trends,
        alerts,
        location,
        days
      );

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Você é um meteorologista experiente que gera resumos concisos e informativos sobre condições climáticas. Seja objetivo e use linguagem acessível.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = chatCompletion.choices[0]?.message?.content;

      if (!content) {
        return this.generateFallbackSummary(
          statistics,
          trends,
          alerts,
          location,
          days
        );
      }

      return content.trim();
    } catch (error) {
      console.error("Erro ao gerar resumo com IA:", error);
      return this.generateFallbackSummary(
        statistics,
        trends,
        alerts,
        location,
        days
      );
    }
  }

  private buildPrompt(
    statistics: WeatherStatistics,
    trends: WeatherTrend[],
    alerts: WeatherAlert[],
    location?: string,
    days?: number
  ): string {
    const locationText = location || "a região";
    const periodText = days ? `últimos ${days} dias` : "período analisado";

    const alertsText =
      alerts.length > 0
        ? `\n\nAlertas ativos:\n${alerts.map((a) => `- ${a.title}: ${a.message}`).join("\n")}`
        : "";

    const trendsText =
      trends.length > 0
        ? `\n\nTendências:\n${trends.map((t) => `- ${t.description}`).join("\n")}`
        : "";

    return `Gere um resumo climático em português para ${locationText} nos ${periodText}.

    Estatísticas:
    - Temperatura: média ${statistics.temperature.average}°C (mín: ${statistics.temperature.min}°C, máx: ${statistics.temperature.max}°C)
    - Umidade: média ${statistics.humidity.average}% (mín: ${statistics.humidity.min}%, máx: ${statistics.humidity.max}%)
    - Vento: média ${statistics.windSpeed.average} km/h
    - Probabilidade de chuva: média ${statistics.rainProbability.average}%${trendsText}${alertsText}

    Crie um resumo de 2-3 parágrafos que seja informativo, objetivo e útil para o dia a dia das pessoas.`;
  }

  private generateFallbackSummary(
    statistics: WeatherStatistics,
    trends: WeatherTrend[],
    alerts: WeatherAlert[],
    location?: string,
    days?: number
  ): string {
    const locationText = location || "a região";
    const periodText = days ? `últimos ${days} dias` : "período analisado";

    let summary = `Resumo climático de ${locationText} nos ${periodText}:\n\n`;

    summary += `A temperatura média foi de ${statistics.temperature.average}°C, variando entre ${statistics.temperature.min}°C e ${statistics.temperature.max}°C. `;
    summary += `A umidade relativa do ar manteve-se em média ${statistics.humidity.average}%, `;
    summary += `com ventos médios de ${statistics.windSpeed.average} km/h.\n\n`;

    const significantTrends = trends.filter((t) => t.direction !== "stable");
    if (significantTrends.length > 0) {
      summary += "Tendências observadas: ";
      summary += significantTrends
        .map((t) => t.description.toLowerCase())
        .join(", ");
      summary += ".\n\n";
    }

    if (alerts.length > 0) {
      summary += `⚠️ ${alerts.length} alerta(s) ativo(s): `;
      summary += alerts.map((a) => a.title).join(", ");
      summary += ".";
    } else {
      summary += "Não há alertas climáticos ativos no momento.";
    }

    return summary;
  }
}
