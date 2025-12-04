import { GoogleGenAI } from "@google/genai";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface WeatherStatistics {
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    avgHumidity: number;
    avgWindSpeed: number;
    totalRecords: number;
}

export interface AIInsights {
    summary: string;
    trends: string[];
    alerts: Array<{ type: 'warning' | 'info'; message: string }>;
    comfortScore: number;
    recommendations: string[]
    generatedAt: Date;
}

@Injectable()
export class AIInsightsService {
    private readonly logger = new Logger(AIInsightsService.name);
    private client: GoogleGenAI;
    private readonly modelName: string;
    private readonly enabled: boolean | undefined;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('ai.gemini.apiKey');
        this.modelName = String(this.configService.get<string>('ai.gemini.model') || 'gemini-2.5-flash');
        this.enabled = this.configService.get<boolean>('ai.enabled') && !!apiKey;

        if (this.enabled && apiKey) {
            this.client = new GoogleGenAI({ apiKey: apiKey })
            this.logger.log('AI Insights initialized with Gemini');
        } else {
            this.logger.warn('AI Insights Service disabled - no API key provided')
        }
    }

    async generateInsights(
        city: string,
        statistics: WeatherStatistics,
        recentData: any[],
    ): Promise<AIInsights> {
        if (!this.enabled) {
            return this.getFallbackInsights(city, statistics)
        }

        try {
            const prompt = this.buildPrompt(city, statistics, recentData);

            const result = await this.client.models.generateContent({
                model: this.modelName,
                contents: [{ parts: [{ text: prompt }]}],
                config: {
                    responseMimeType: 'application/json',
                },
            });

            const text = result.text;

            if (!text) {
                throw new Error('Empty response from AI')
            }

            const insights = this.parseAIResponse(text);

            this.logger.log(`Generated AI insights for ${city}`);

            return insights;

        } catch (error) {
            this.logger.error('Failed to generate insights', error.stack);
            return this.getFallbackInsights(city, statistics);
        }
    }

    private buildPrompt(
        city: string,
        statistics: WeatherStatistics,
        recentData: any[],
    ): string {
        const dataContext = recentData
            .slice(0, 10)
            .map(
                (d) =>
                    `${new Date(d.timestamp).toLocaleDateString()}: ${d.temperature}°C, ${d.humidity}% umidade`,
            )
            .join('\n');

        return `
            Você é um analista meteorológico especializado. Analise os seguintes dados climáticos de ${city}:

            ESTATÍSTICAS DO PERÍODO:
            - Temperatura média: ${statistics.avgTemperature.toFixed(1)}°C
            - Temperatura mínima: ${statistics.minTemperature.toFixed(1)}°C
            - Temperatura máxima: ${statistics.maxTemperature.toFixed(1)}°C
            - Umidade média: ${statistics.avgHumidity.toFixed(1)}%
            - Velocidade média do vento: ${statistics.avgWindSpeed.toFixed(1)} km/h
            - Total de registros: ${statistics.totalRecords}

            DADOS RECENTES:
            ${dataContext}

            Gere insights no formato JSON EXATO abaixo (sem markdown, apenas JSON puro):

            {
            "summary": "Resumo em português (2-3 frases sobre o clima geral)",
            "trends": ["tendência 1", "tendência 2", "tendência 3"],
            "alerts": [
                {"type": "warning", "message": "alerta se houver condições adversas"},
                {"type": "info", "message": "informação relevante"}
            ],
            "comfortScore": 75,
            "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"]
            }

            REGRAS:
            - summary: análise objetiva do clima
            - trends: padrões observados (temperatura, umidade, vento)
            - alerts: avisos importantes (use "warning" para riscos, "info" para observações)
            - comfortScore: 0-100 (conforto térmico considerando temperatura e umidade)
            - recommendations: sugestões práticas para o dia

            Responda APENAS com o JSON, sem texto adicional antes ou depois.
        `;
    }

    private parseAIResponse(text: string): AIInsights {
        try {
            const parsed = JSON.parse(text);

            return {
                summary: parsed.summary || 'Sem resumo disponível',
                trends: Array.isArray(parsed.trends) ? parsed.trens: [],
                alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
                comfortScore: Math.min(100, Math.max(0, parsed.comfortScore || 50)),
                recommendations: Array.isArray(parsed.recommendations)
                    ? parsed.recommendations
                    : [],
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('Failed to parse AI response', error.stack);
            this.logger.debug('AI response:', text);
            throw new Error('Failed to parse AI response');
        }
    }

    private getFallbackInsights(
        city: string,
        statistics: WeatherStatistics,
    ): AIInsights {
        const comfortScore = this.calculateComfortScore(
            statistics.avgTemperature,
            statistics.avgHumidity,
        );

        const alerts: Array<{ type: 'warning' | 'info'; message: string }> = [];

        if (statistics.avgTemperature > 35) {
            alerts.push({
                type: 'warning',
                message: 'Temperatura muito alta - risco de desidratação',
            });
        } else if (statistics.avgTemperature < 10) {
            alerts.push({
                type: 'warning',
                message: 'Temperatura muito baixa - proteja-se do frio',
            });
        }

        if (statistics.avgHumidity > 80) {
            alerts.push({
                type: 'info',
                message: 'Umidade elevada - sensação de abafado',
            });
        }

        return {
            summary: `Em ${city}, a temperatura média foi de ${statistics.avgTemperature.toFixed(1)}°C com umidade de ${statistics.avgHumidity.toFixed(1)}%. Foram coletados ${statistics.totalRecords} registros no período.`,
            trends: [
                `Temperatura variando entre ${statistics.minTemperature.toFixed(1)}°C e ${statistics.maxTemperature.toFixed(1)}°C`,
                `Umidade média de ${statistics.avgHumidity.toFixed(1)}%`,
                `Vento médio de ${statistics.avgWindSpeed.toFixed(1)} km/h`,
            ],
            alerts,
            comfortScore,
            recommendations: this.getRecommendations(statistics),
            generatedAt: new Date(),
        };
    }

    private calculateComfortScore(temperature: number, humidity: number): number {
        let score = 100

        if (temperature < 20) {
            score -= (20 - temperature) * 3;
        } else if (temperature > 25) {
            score -= (temperature - 25) * 3;
        }

        if (humidity < 40) {
            score -= (40 - humidity) * 0.5;
        } else if (humidity > 60) {
            score -= (humidity - 60) * 0.5;
        }

        return Math.max(0, Math.min(100, Math.round(score)))
    }

    private getRecommendations(statistics: WeatherStatistics): string[] {
        const recommendations: string[] = [];

        if (statistics.avgTemperature > 30) {
            recommendations.push('Mantenha-se hidratado e evite exposição prolongada ao sol');
        }

        if (statistics.avgHumidity > 70) {
            recommendations.push('Use roupas leves e respiráveis');
        }

        if (statistics.avgWindSpeed > 30) {
            recommendations.push('Cuidado com objetos soltos - ventos fortes');
        }

        if (recommendations.length === 0) {
            recommendations.push('Condições climáticas favoráveis');
        }

        return recommendations;
    }
}
