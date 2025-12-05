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

    const latestData = data[data.length - 1];
    const currentConditions = `
Condições atuais:
- Temperatura: ${latestData.temperature}°C
- Umidade: ${latestData.humidity}%
- Velocidade do vento: ${latestData.windSpeed} km/h
- Condição: ${latestData.description || latestData.condition}
- Probabilidade de chuva: ${latestData.rainProbability}%
${latestData.visibility ? `- Visibilidade: ${latestData.visibility} km` : ''}
${latestData.solarRadiation ? `- Radiação solar: ${latestData.solarRadiation} W/m²` : ''}
${latestData.pressure ? `- Pressão atmosférica: ${latestData.pressure} hPa` : ''}
`;

    const prompt = `Analise os seguintes dados climáticos dos últimos ${days} dias e forneça insights detalhados em formato JSON:

${summary}

${currentConditions}

Forneça uma resposta JSON com a seguinte estrutura:
{
  "summary": "Resumo geral das condições climáticas em português",
  "trends": "Tendências observadas (temperatura subindo/caindo, padrões de chuva, etc.) em português",
  "alerts": ["Alerta 1", "Alerta 2"],
  "comfortScore": 75,
  "classification": "agradável|quente|frio|chuvoso|extremo",
  "detailedAnalysis": "Análise detalhada e completa das condições climáticas atuais, incluindo temperatura, umidade, vento, visibilidade, radiação solar e pressão atmosférica. Descreva como essas condições se relacionam e o que significam para o conforto e atividades ao ar livre. Em português.",
  "activitySuggestions": ["Sugestão de atividade 1", "Sugestão de atividade 2", "Sugestão de atividade 3"]
}

O comfortScore deve ser um número de 0 a 100, onde 100 é o clima mais confortável.
A classificação deve ser uma das opções: "agradável", "quente", "frio", "chuvoso", ou "extremo".
As activitySuggestions devem ser sugestões práticas de atividades adequadas para as condições climáticas atuais (ex: "Ideal para caminhadas ao ar livre", "Recomendado usar protetor solar", "Melhor fazer atividades indoor"). Em português.
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
        detailedAnalysis: parsed.detailedAnalysis || '',
        activitySuggestions: Array.isArray(parsed.activitySuggestions) ? parsed.activitySuggestions : [],
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
    const visibilities = data.map((d) => d.visibility).filter((v) => v != null);
    const solarRads = data.map((d) => d.solarRadiation).filter((v) => v != null);
    const pressures = data.map((d) => d.pressure).filter((v) => v != null);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgRainProb = rainProbs.reduce((a, b) => a + b, 0) / rainProbs.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgVisibility = visibilities.length > 0 ? visibilities.reduce((a, b) => a + b, 0) / visibilities.length : null;
    const avgSolarRad = solarRads.length > 0 ? solarRads.reduce((a, b) => a + b, 0) / solarRads.length : null;
    const avgPressure = pressures.length > 0 ? pressures.reduce((a, b) => a + b, 0) / pressures.length : null;

    return `
- Total de registros: ${data.length}
- Temperatura média: ${avgTemp.toFixed(1)}°C
- Temperatura máxima: ${maxTemp.toFixed(1)}°C
- Temperatura mínima: ${minTemp.toFixed(1)}°C
- Umidade média: ${avgHumidity.toFixed(1)}%
- Probabilidade de chuva média: ${avgRainProb.toFixed(1)}%
${avgVisibility ? `- Visibilidade média: ${avgVisibility.toFixed(1)} km` : ''}
${avgSolarRad ? `- Radiação solar média: ${avgSolarRad.toFixed(1)} W/m²` : ''}
${avgPressure ? `- Pressão atmosférica média: ${avgPressure.toFixed(1)} hPa` : ''}
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

    const latest = data[data.length - 1];
    const activitySuggestions = this.generateActivitySuggestions(latest, avgTemp, avgRainProb);

    return {
      summary: `Nos últimos ${data.length} registros, a temperatura média foi de ${avgTemp.toFixed(1)}°C, com umidade de ${avgHumidity.toFixed(1)}% e probabilidade de chuva de ${avgRainProb.toFixed(1)}%.`,
      trends: this.calculateTrends(data),
      alerts,
      comfortScore,
      classification,
      detailedAnalysis: this.generateDetailedAnalysis(latest, avgTemp, avgHumidity, avgRainProb),
      activitySuggestions,
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
      detailedAnalysis: 'Aguardando mais dados para análise detalhada.',
      activitySuggestions: [],
    };
  }

  private generateDetailedAnalysis(
    latest: WeatherLogDocument,
    avgTemp: number,
    avgHumidity: number,
    avgRainProb: number,
  ): string {
    let analysis = `O tempo está ${latest.description || latest.condition.toLowerCase()}, com temperatura em torno de ${latest.temperature.toFixed(1)}°C. `;
    
    analysis += `A umidade relativa está em ${latest.humidity.toFixed(1)}%, `;
    
    if (latest.humidity < 40) {
      analysis += 'indicando ar seco. ';
    } else if (latest.humidity > 70) {
      analysis += 'indicando ar úmido. ';
    } else {
      analysis += 'em níveis confortáveis. ';
    }

    if (latest.rainProbability > 50) {
      analysis += `Há ${latest.rainProbability.toFixed(0)}% de probabilidade de chuva. `;
    } else {
      analysis += 'Não há previsão significativa de chuva. ';
    }

    analysis += `O vento sopra a ${latest.windSpeed.toFixed(1)} km/h. `;

    if (latest.visibility) {
      if (latest.visibility > 10) {
        analysis += `A visibilidade é excelente, superior a ${latest.visibility.toFixed(1)} km. `;
      } else if (latest.visibility > 5) {
        analysis += `A visibilidade é boa, em torno de ${latest.visibility.toFixed(1)} km. `;
      } else {
        analysis += `A visibilidade está reduzida, cerca de ${latest.visibility.toFixed(1)} km. `;
      }
    }

    if (latest.solarRadiation) {
      if (latest.solarRadiation > 800) {
        analysis += `A radiação solar está muito alta (${latest.solarRadiation.toFixed(0)} W/m²), indicando necessidade de proteção solar intensa. `;
      } else if (latest.solarRadiation > 400) {
        analysis += `A radiação solar está moderada (${latest.solarRadiation.toFixed(0)} W/m²). `;
      } else {
        analysis += `A radiação solar está baixa (${latest.solarRadiation.toFixed(0)} W/m²). `;
      }
    }

    if (latest.pressure) {
      analysis += `A pressão atmosférica está em ${latest.pressure.toFixed(1)} hPa. `;
    }

    return analysis.trim();
  }

  private generateActivitySuggestions(
    latest: WeatherLogDocument,
    avgTemp: number,
    avgRainProb: number,
  ): string[] {
    const suggestions: string[] = [];

    // Sugestões baseadas em temperatura
    if (latest.temperature > 25 && latest.temperature < 30) {
      suggestions.push('Ideal para atividades ao ar livre');
      suggestions.push('Perfeito para caminhadas e exercícios');
    } else if (latest.temperature > 30) {
      suggestions.push('Use protetor solar e evite exposição prolongada');
      suggestions.push('Prefira atividades em horários mais frescos');
      if (latest.solarRadiation && latest.solarRadiation > 800) {
        suggestions.push('Radiação UV muito alta - proteção solar obrigatória');
      }
    } else if (latest.temperature < 15) {
      suggestions.push('Use roupas adequadas para o frio');
      suggestions.push('Atividades indoor são mais confortáveis');
    }

    // Sugestões baseadas em chuva
    if (latest.rainProbability > 70) {
      suggestions.push('Alta probabilidade de chuva - prefira atividades indoor');
      suggestions.push('Leve guarda-chuva se precisar sair');
    } else if (latest.rainProbability < 30) {
      suggestions.push('Condições ideais para atividades ao ar livre');
    }

    // Sugestões baseadas em vento
    if (latest.windSpeed > 20) {
      suggestions.push('Vento forte - cuidado com atividades ao ar livre');
    } else if (latest.windSpeed < 10) {
      suggestions.push('Vento suave - ótimo para atividades ao ar livre');
    }

    // Sugestões baseadas em visibilidade
    if (latest.visibility && latest.visibility < 5) {
      suggestions.push('Visibilidade reduzida - evite dirigir se possível');
    }

    // Sugestões baseadas em umidade
    if (latest.humidity > 80) {
      suggestions.push('Alta umidade - pode ser desconfortável para exercícios intensos');
    } else if (latest.humidity < 30) {
      suggestions.push('Ar seco - mantenha-se hidratado');
    }

    // Se não houver sugestões específicas, adicionar genéricas
    if (suggestions.length === 0) {
      suggestions.push('Condições climáticas adequadas para a maioria das atividades');
    }

    return suggestions.slice(0, 5); // Limitar a 5 sugestões
  }
}

