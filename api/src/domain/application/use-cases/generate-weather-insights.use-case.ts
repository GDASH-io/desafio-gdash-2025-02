import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";
import Groq from "groq-sdk";

export interface GenerateWeatherInsightsUseCaseRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  limit?: number;
}

export interface WeatherInsight {
  summary: string;
  trends: string[];
  recommendations: string[];
  predictions: string[];
  anomalies: string[];
  generatedAt: Date;
}

export interface GenerateWeatherInsightsUseCaseResponse {
  insights: WeatherInsight;
  dataPointsAnalyzed: number;
}

@Injectable()
export class GenerateWeatherInsightsUseCase {
  private groq: Groq;

  constructor(private weatherLogRepository: WeatherLogRepository) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
    });
  }

  async execute(
    request: GenerateWeatherInsightsUseCaseRequest
  ): Promise<Either<null, GenerateWeatherInsightsUseCaseResponse>> {
    const result = await this.weatherLogRepository.findMany({
      page: 1,
      limit: request.limit || 100,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
    });

    if (result.data.length === 0) {
      return right({
        insights: {
          summary: "Nenhum dado disponível para análise.",
          trends: [],
          recommendations: [],
          predictions: [],
          anomalies: [],
          generatedAt: new Date(),
        },
        dataPointsAnalyzed: 0,
      });
    }

    const weatherData = result.data.map((log) => ({
      data: log.collectedAt.toISOString(),
      localizacao: log.location,
      temperatura: log.temperature,
      umidade: log.humidity,
      velocidadeVento: log.windSpeed,
      condicao: log.skyCondition,
      probabilidadeChuva: log.rainProbability,
    }));

    const prompt = this.buildPrompt(weatherData, request.location);
    const insights = await this.generateInsightsWithGroq(prompt);

    return right({
      insights: {
        ...insights,
        generatedAt: new Date(),
      },
      dataPointsAnalyzed: result.data.length,
    });
  }

  private buildPrompt(weatherData: any[], location?: string): string {
    const locationText = location || "a região";
    const dataJson = JSON.stringify(weatherData, null, 2);

    return `Você é um especialista em meteorologia e análise de dados climáticos. 

Analise os seguintes dados climáticos de ${locationText}:

${dataJson}

Com base nesses dados, forneça uma análise detalhada em formato JSON com a seguinte estrutura:

{
  "summary": "Um resumo executivo do clima no período analisado (2-3 frases)",
  "trends": ["Array de tendências observadas nos dados"],
  "recommendations": ["Array de recomendações práticas baseadas nos padrões identificados"],
  "predictions": ["Array de previsões ou expectativas para os próximos dias"],
  "anomalies": ["Array de anomalias ou padrões incomuns detectados"]
}

Seja específico, use números e dados concretos, e forneça insights acionáveis.
Responda APENAS com o JSON, sem texto adicional.`;
  }

  private async generateInsightsWithGroq(
    prompt: string
  ): Promise<Omit<WeatherInsight, "generatedAt">> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Resposta vazia da IA");
      }

      const insights = JSON.parse(content);

      return {
        summary: insights.summary || "Análise indisponível",
        trends: insights.trends || [],
        recommendations: insights.recommendations || [],
        predictions: insights.predictions || [],
        anomalies: insights.anomalies || [],
      };
    } catch (error) {
      console.error("Erro ao gerar insights com Groq:", error);

      return this.generateFallbackInsights();
    }
  }

  private generateFallbackInsights(): Omit<WeatherInsight, "generatedAt"> {
    return {
      summary:
        "Não foi possível gerar insights com IA. Configure a GROQ_API_KEY para análises detalhadas.",
      trends: ["Sistema coletando dados climáticos regularmente"],
      recommendations: [
        "Obtenha uma API key gratuita em: https://console.groq.com",
        "Configure GROQ_API_KEY no arquivo .env",
      ],
      predictions: [
        "Sistema pronto para análises quando IA estiver configurada",
      ],
      anomalies: [],
    };
  }
}
