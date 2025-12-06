import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Insight, InsightType, InsightSeverity } from './schemas/insight.schema';
import { WeatherService } from '../weather/weather.service';
import { GeminiService } from './ai/gemini.service';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Insight.name) private insightModel: Model<Insight>,
    private weatherService: WeatherService,
    private geminiService: GeminiService,
  ) {}

  async generateInsights(): Promise<Insight[]> {
    // Deletar insights antigos de IA (mantém apenas os últimos 3)
    const oldAiInsights = await this.insightModel
      .find({ 'metadata.source': 'Google Gemini AI' })
      .sort({ generatedAt: -1 })
      .skip(3)
      .exec();

    if (oldAiInsights.length > 0) {
      const idsToDelete = oldAiInsights.map(insight => insight._id);
      await this.insightModel.deleteMany({ _id: { $in: idsToDelete } });
    }

    // Buscar dados dos últimos 7 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const weatherLogs = await this.weatherService.findByDateRange(startDate, endDate);

    if (weatherLogs.length === 0) {
      return [];
    }

    const insights: Insight[] = [];

    // Gerar insights com IA (Google Gemini)
    try {
      console.log('🚀 Iniciando geração de insights com IA...');
      const aiAnalysis = await this.geminiService.generateInsights(weatherLogs);

      const aiInsight = new this.insightModel({
        type: InsightType.SUMMARY,
        title: '🤖 Análise Semanal com IA',
        content: aiAnalysis,
        severity: InsightSeverity.INFO,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: weatherLogs.length,
          source: 'Google Gemini AI',
        },
        generatedAt: new Date(),
      });

      insights.push(aiInsight);
      console.log('✅ Insight com IA criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao gerar insights com IA:', error);
      console.log('⚠️ Usando análise tradicional como fallback...');
      // Se falhar, gerar insights com lógica tradicional
      const fallbackInsights = await this.generateTraditionalInsights(weatherLogs, startDate, endDate);
      insights.push(...fallbackInsights);
      console.log(`📊 ${fallbackInsights.length} insights tradicionais gerados`);
    }

    // Salvar insights gerados
    const savedInsights = await this.insightModel.insertMany(insights);

    return savedInsights;
  }

  private async generateTraditionalInsights(weatherLogs: any[], startDate: Date, endDate: Date): Promise<any[]> {
    const insights: any[] = [];

    // Análise de temperatura
    const tempInsight = await this.analyzeTemperature(weatherLogs, startDate, endDate);
    if (tempInsight) insights.push(tempInsight);

    // Análise de umidade
    const humidityInsight = await this.analyzeHumidity(weatherLogs, startDate, endDate);
    if (humidityInsight) insights.push(humidityInsight);

    // Análise de chuva
    const rainInsight = await this.analyzeRain(weatherLogs, startDate, endDate);
    if (rainInsight) insights.push(rainInsight);

    // Tendências
    const trendInsight = await this.analyzeTrend(weatherLogs, startDate, endDate);
    if (trendInsight) insights.push(trendInsight);

    // Resumo geral
    const summaryInsight = await this.generateSummary(weatherLogs, startDate, endDate);
    if (summaryInsight) insights.push(summaryInsight);

    return insights;
  }

  private async analyzeTemperature(logs: any[], startDate: Date, endDate: Date) {
    const temperatures = logs.map(log => log.temperature);
    const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const max = Math.max(...temperatures);
    const min = Math.min(...temperatures);

    let insight: any = null;

    if (max > 35) {
      insight = new this.insightModel({
        type: InsightType.ALERT,
        title: 'Alerta: Calor Extremo',
        content: `Temperatura máxima de ${max.toFixed(1)}°C registrada. Mantenha-se hidratado e evite exposição prolongada ao sol.`,
        severity: InsightSeverity.DANGER,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgTemperature: avg,
        },
      });
    } else if (min < 10) {
      insight = new this.insightModel({
        type: InsightType.ALERT,
        title: 'Alerta: Frio Intenso',
        content: `Temperatura mínima de ${min.toFixed(1)}°C registrada. Agasalhe-se bem e proteja-se do frio.`,
        severity: InsightSeverity.WARNING,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgTemperature: avg,
        },
      });
    } else if (avg >= 20 && avg <= 28) {
      insight = new this.insightModel({
        type: InsightType.RECOMMENDATION,
        title: 'Clima Agradável',
        content: `Temperatura média de ${avg.toFixed(1)}°C. Condições ideais para atividades ao ar livre.`,
        severity: InsightSeverity.INFO,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgTemperature: avg,
        },
      });
    }

    return insight;
  }

  private async analyzeHumidity(logs: any[], startDate: Date, endDate: Date) {
    const humidities = logs.map(log => log.humidity);
    const avg = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    if (avg > 80) {
      return new this.insightModel({
        type: InsightType.ALERT,
        title: 'Umidade Muito Alta',
        content: `Umidade média de ${avg.toFixed(1)}%. Sensação de abafamento. Mantenha ambientes ventilados.`,
        severity: InsightSeverity.WARNING,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgHumidity: avg,
        },
      });
    } else if (avg < 30) {
      return new this.insightModel({
        type: InsightType.ALERT,
        title: 'Umidade Muito Baixa',
        content: `Umidade média de ${avg.toFixed(1)}%. Hidrate-se bem e use umidificador de ar.`,
        severity: InsightSeverity.WARNING,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgHumidity: avg,
        },
      });
    }

    return null;
  }

  private async analyzeRain(logs: any[], startDate: Date, endDate: Date) {
    const logsWithRain = logs.filter(log => log.rainProbability && log.rainProbability > 50);
    
    if (logsWithRain.length > logs.length * 0.3) {
      return new this.insightModel({
        type: InsightType.ALERT,
        title: 'Alta Probabilidade de Chuva',
        content: `${logsWithRain.length} registros com probabilidade de chuva acima de 50%. Leve guarda-chuva.`,
        severity: InsightSeverity.INFO,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
        },
      });
    }

    return null;
  }

  private async analyzeTrend(logs: any[], startDate: Date, endDate: Date) {
    if (logs.length < 3) return null;

    // Pegar primeira e última metade para comparar
    const firstHalf = logs.slice(0, Math.floor(logs.length / 2));
    const secondHalf = logs.slice(Math.floor(logs.length / 2));

    const avgFirst = firstHalf.reduce((sum, log) => sum + log.temperature, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, log) => sum + log.temperature, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (Math.abs(diff) > 3) {
      const trend = diff > 0 ? 'elevação' : 'queda';
      return new this.insightModel({
        type: InsightType.TREND,
        title: `Tendência: Temperatura em ${trend}`,
        content: `Observada ${trend} de ${Math.abs(diff).toFixed(1)}°C nos últimos dias.`,
        severity: InsightSeverity.INFO,
        metadata: {
          startDate,
          endDate,
          dataPointsAnalyzed: logs.length,
          avgTemperature: (avgFirst + avgSecond) / 2,
        },
      });
    }

    return null;
  }

  private async generateSummary(logs: any[], startDate: Date, endDate: Date) {
    const temperatures = logs.map(log => log.temperature);
    const humidities = logs.map(log => log.humidity);
    
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    
    // Condição predominante
    const conditions = logs.map(log => log.condition);
    const conditionCounts = conditions.reduce((acc, condition) => {
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});
    const predominantCondition = Object.keys(conditionCounts).reduce((a, b) => 
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    // Dias com chuva
    const rainyDays = logs.filter(log => 
      log.condition.includes('rain') || log.condition.includes('chuva')
    ).length;

    const content = `Últimos ${logs.length} registros: Temperatura média ${avgTemp.toFixed(1)}°C, ` +
                   `Umidade média ${avgHumidity.toFixed(1)}%. ` +
                   `Condição predominante: ${predominantCondition}. ` +
                   `${rainyDays} registros com chuva.`;

    return new this.insightModel({
      type: InsightType.SUMMARY,
      title: 'Resumo dos Últimos Dias',
      content,
      severity: InsightSeverity.INFO,
      metadata: {
        startDate,
        endDate,
        dataPointsAnalyzed: logs.length,
        avgTemperature: avgTemp,
        avgHumidity: avgHumidity,
      },
    });
  }

  async findAll(limit = 20): Promise<Insight[]> {
    return this.insightModel
      .find()
      .sort({ generatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async getLatest(): Promise<Insight[]> {
    return this.insightModel
      .find()
      .sort({ generatedAt: -1 })
      .limit(5)
      .exec();
  }

  async deleteOld(): Promise<void> {
    // Deletar insights com mais de 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.insightModel.deleteMany({
      generatedAt: { $lt: thirtyDaysAgo },
    });
  }
}