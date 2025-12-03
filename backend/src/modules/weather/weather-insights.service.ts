import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './weather.schema';
import { WeatherInsightsDto } from './weather.dto';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class WeatherInsightsService {
  private readonly logger = new Logger(WeatherInsightsService.name);
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private insightsCache: Map<string, { data: WeatherInsightsDto; timestamp: Date }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hora

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async generateInsights(days: number = 7): Promise<WeatherInsightsDto> {
    const cacheKey = `insights_${days}`;
    const cached = this.insightsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_TTL) {
      return cached.data;
    }

    const historicalData = await this.getHistoricalData(days);

    if (historicalData.length === 0) {
      return this.getDefaultInsights();
    }

    try {
      const insights = await this.generateWithAI(historicalData, days);
      this.insightsCache.set(cacheKey, { data: insights, timestamp: new Date() });
      return insights;
    } catch (error) {
      this.logger.error('Error generating insights with AI, using fallback', error);
      return this.generateFallbackInsights(historicalData);
    }
  }

  private async generateWithAI(
    data: WeatherLogDocument[],
    days: number,
  ): Promise<WeatherInsightsDto> {
    const summary = this.prepareDataSummary(data);

    const prompt = `Analise os seguintes dados climáticos dos últimos ${days} dias e forneça insights detalhados em formato JSON:

${summary}

Forneça uma resposta JSON com a seguinte estrutura:
{
  "summary": "Resumo geral das condições climáticas",
  "trends": "Tendências observadas (temperatura subindo/caindo, padrões de chuva, etc.)",
  "alerts": ["Alerta 1", "Alerta 2"],
  "comfortScore": 75,
  "classification": "agradável|quente|frio|chuvoso|extremo"
}

O comfortScore deve ser um número de 0 a 100, onde 100 é o clima mais confortável.
A classificação deve ser uma das opções: "agradável", "quente", "frio", "chuvoso", ou "extremo".
Retorne APENAS o JSON, sem markdown ou texto adicional.`;

    try {
      if (this.openai) {
        return await this.generateWithOpenAI(prompt);
      }
    } catch (error) {
      this.logger.warn('OpenAI failed, trying Gemini', error);
    }

    if (this.gemini) {
      return await this.generateWithGemini(prompt);
    }

    throw new Error('No AI service available');
  }

  private async generateWithOpenAI(prompt: string): Promise<WeatherInsightsDto> {
    if (!this.openai) throw new Error('OpenAI not configured');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return this.parseAIResponse(content);
  }

  private async generateWithGemini(prompt: string): Promise<WeatherInsightsDto> {
    if (!this.gemini) throw new Error('Gemini not configured');

    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return this.parseAIResponse(content);
  }

  private parseAIResponse(content: string): WeatherInsightsDto {
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        summary: parsed.summary || 'Análise não disponível',
        trends: parsed.trends || 'Tendências não identificadas',
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
        comfortScore: parsed.comfortScore || 50,
        classification: parsed.classification || 'agradável',
      };
    } catch (error) {
      this.logger.error('Error parsing AI response', error);
      throw error;
    }
  }

  private prepareDataSummary(data: WeatherLogDocument[]): string {
    const temps = data.map((d) => d.temperature);
    const humidities = data.map((d) => d.humidity);
    const rainProbs = data.map((d) => d.rainProbability);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgRainProb = rainProbs.reduce((a, b) => a + b, 0) / rainProbs.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    return `
- Total de registros: ${data.length}
- Temperatura média: ${avgTemp.toFixed(1)}°C
- Temperatura máxima: ${maxTemp.toFixed(1)}°C
- Temperatura mínima: ${minTemp.toFixed(1)}°C
- Umidade média: ${avgHumidity.toFixed(1)}%
- Probabilidade de chuva média: ${avgRainProb.toFixed(1)}%
- Condições mais comuns: ${this.getMostCommonConditions(data)}
`;
  }

  private getMostCommonConditions(data: WeatherLogDocument[]): string {
    const conditions = data.map((d) => d.condition);
    const counts: Record<string, number> = {};
    conditions.forEach((c) => {
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([condition]) => condition)
      .join(', ');
  }

  private async getHistoricalData(days: number): Promise<WeatherLogDocument[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.weatherLogModel
      .find({
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  private generateFallbackInsights(data: WeatherLogDocument[]): WeatherInsightsDto {
    const temps = data.map((d) => d.temperature);
    const humidities = data.map((d) => d.humidity);
    const rainProbs = data.map((d) => d.rainProbability);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgRainProb = rainProbs.reduce((a, b) => a + b, 0) / rainProbs.length;

    let classification = 'agradável';
    if (avgTemp > 30) classification = 'quente';
    else if (avgTemp < 15) classification = 'frio';
    if (avgRainProb > 50) classification = 'chuvoso';

    const alerts: string[] = [];
    if (avgTemp > 35) alerts.push('Calor extremo');
    if (avgTemp < 5) alerts.push('Frio intenso');
    if (avgRainProb > 70) alerts.push('Alta probabilidade de chuva');

    const comfortScore = this.calculateComfortScore(avgTemp, avgHumidity, avgRainProb);

    return {
      summary: `Nos últimos ${data.length} registros, a temperatura média foi de ${avgTemp.toFixed(1)}°C, com umidade de ${avgHumidity.toFixed(1)}% e probabilidade de chuva de ${avgRainProb.toFixed(1)}%.`,
      trends: this.calculateTrends(data),
      alerts,
      comfortScore,
      classification,
    };
  }

  private calculateComfortScore(temp: number, humidity: number, rainProb: number): number {
    let score = 100;

    // Penalizar temperaturas extremas
    if (temp > 30 || temp < 10) score -= 30;
    else if (temp > 25 || temp < 15) score -= 15;

    // Penalizar umidade extrema
    if (humidity > 80 || humidity < 30) score -= 20;
    else if (humidity > 70 || humidity < 40) score -= 10;

    // Penalizar alta probabilidade de chuva
    if (rainProb > 70) score -= 25;
    else if (rainProb > 50) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateTrends(data: WeatherLogDocument[]): string {
    if (data.length < 2) return 'Dados insuficientes para identificar tendências';

    const recent = data.slice(-5);
    const older = data.slice(0, 5);

    if (recent.length === 0 || older.length === 0) {
      return 'Dados insuficientes para identificar tendências';
    }

    const recentAvg = recent.reduce((sum, d) => sum + d.temperature, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.temperature, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 2) return 'Temperatura em tendência de aumento';
    if (diff < -2) return 'Temperatura em tendência de queda';
    return 'Temperatura estável';
  }

  private getDefaultInsights(): WeatherInsightsDto {
    return {
      summary: 'Dados insuficientes para análise. Aguarde a coleta de mais dados climáticos.',
      trends: 'Não há dados suficientes para identificar tendências.',
      alerts: [],
      comfortScore: 50,
      classification: 'agradável',
    };
  }
}

