import { Injectable, Logger } from '@nestjs/common';
import { Weather } from '../schemas/weather.schema';
import axios from 'axios';

interface WeatherStatistics {
  temperature: {
    current: number;
    avg: number;
    min: number;
    max: number;
    trend: number;
  };
  humidity: {
    current: number;
    avg: number;
    min: number;
    max: number;
  };
  wind_speed: {
    current: number;
    avg: number;
    max: number;
  };
  precipitation: {
    total: number;
  };
  period: {
    start: Date;
    end: Date;
    records: number;
  };
}

interface WeatherPattern {
  type: string;
  description: string;
  value?: string;
  change?: string;
  severity: 'low' | 'medium' | 'high';
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  private togetherApiKey: string;
  private aiCache: {
    insights: string;
    timestamp: Date;
    expiresAt: Date;
  } | null = null;
  private readonly CACHE_DURATION_HOURS = 6;
  private readonly TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

  constructor() {
    // Usar API key do Together AI
    this.togetherApiKey = process.env.TOGETHER_API_KEY || '';

    if (this.togetherApiKey) {
      this.logger.log('✅ Together AI configurado com cache de 6 horas');
    } else {
      this.logger.warn('⚠️  TOGETHER_API_KEY não encontrada. Insights de IA desabilitados.');
    }
  }

  /**
   * Gera insights automáticos baseados nos dados climáticos
   */
  async generateInsights(data: Weather[]): Promise<any> {
    this.logger.log(`🤖 Gerando insights para ${data.length} registros`);

    if (data.length === 0) {
      return {
        summary: 'Sem dados suficientes para análise',
        insights: [],
        statistics: null,
      };
    }

    // Análise estatística básica
    const stats = this.calculateStatistics(data);

    // Detectar padrões e anomalias
    const patterns = this.detectPatterns(data);

    // Gerar insights com IA (se disponível)
    let aiInsights = null;
    if (this.togetherApiKey) {
      aiInsights = await this.generateAIInsights(data, stats);
    }

    return {
      summary: this.generateSummary(stats, patterns),
      statistics: stats,
      patterns: patterns,
      ai_insights: aiInsights,
      recommendations: this.generateRecommendations(stats, patterns),
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Calcula estatísticas detalhadas
   */
  private calculateStatistics(data: Weather[]) {
    const temperatures = data.map((d) => d.temperature).filter((t) => t != null);
    const humidities = data.map((d) => d.humidity).filter((h) => h != null);
    const windSpeeds = data.map((d) => d.wind_speed).filter((w) => w != null);
    const precipitations = data.map((d) => d.precipitation || 0);

    return {
      temperature: {
        current: temperatures[0],
        avg: this.average(temperatures),
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        median: this.median(temperatures),
        trend: this.calculateTrend(temperatures),
      },
      humidity: {
        current: humidities[0],
        avg: this.average(humidities),
        min: Math.min(...humidities),
        max: Math.max(...humidities),
        median: this.median(humidities),
      },
      wind_speed: {
        current: windSpeeds[0],
        avg: this.average(windSpeeds),
        min: Math.min(...windSpeeds),
        max: Math.max(...windSpeeds),
      },
      precipitation: {
        total: precipitations.reduce((a, b) => a + b, 0),
        avg: this.average(precipitations),
        max: Math.max(...precipitations),
      },
      period: {
        start: data[data.length - 1]?.createdAt,
        end: data[0]?.createdAt,
        records: data.length,
      },
    };
  }

  /**
   * Detecta padrões e anomalias
   */
  private detectPatterns(data: Weather[]): WeatherPattern[] {
    const patterns: WeatherPattern[] = [];

    // Detectar tendência de aquecimento/resfriamento
    const recentTemps = data.slice(0, 10).map((d) => d.temperature);
    const olderTemps = data.slice(-10).map((d) => d.temperature);
    const tempChange = this.average(recentTemps) - this.average(olderTemps);

    if (Math.abs(tempChange) > 2) {
      patterns.push({
        type: 'temperature_trend',
        description: tempChange > 0 ? 'Tendência de aquecimento' : 'Tendência de resfriamento',
        change: `${tempChange > 0 ? '+' : ''}${tempChange.toFixed(1)}°C`,
        severity: Math.abs(tempChange) > 5 ? 'high' : 'medium',
      });
    }

    // Detectar alta umidade persistente
    const avgHumidity = this.average(data.slice(0, 10).map((d) => d.humidity));
    if (avgHumidity > 80) {
      patterns.push({
        type: 'high_humidity',
        description: 'Umidade elevada persistente',
        value: `${avgHumidity.toFixed(0)}%`,
        severity: 'medium',
      });
    }

    // Detectar ventos fortes
    const maxWind = Math.max(...data.slice(0, 10).map((d) => d.wind_speed));
    if (maxWind > 40) {
      patterns.push({
        type: 'strong_winds',
        description: 'Ventos fortes detectados',
        value: `${maxWind.toFixed(1)} km/h`,
        severity: 'high',
      });
    }

    // Detectar precipitação significativa
    const totalPrecip = data.slice(0, 10).reduce((sum, d) => sum + (d.precipitation || 0), 0);
    if (totalPrecip > 10) {
      patterns.push({
        type: 'heavy_precipitation',
        description: 'Precipitação significativa',
        value: `${totalPrecip.toFixed(1)} mm`,
        severity: 'high',
      });
    }

    return patterns;
  }

  /**
   * Verifica se o cache da IA ainda é válido
   */
  private isCacheValid(): boolean {
    if (!this.aiCache) return false;
    return new Date() < this.aiCache.expiresAt;
  }

  /**
   * Gera insights usando Together AI com cache de 6 horas
   */
  private async generateAIInsights(
    data: Weather[],
    stats: WeatherStatistics,
  ): Promise<string | null> {
    if (!this.togetherApiKey) return null;

    // Retornar cache se ainda válido
    if (this.isCacheValid()) {
      this.logger.log(
        '📦 Usando insights em cache (válido até ' + this.aiCache.expiresAt.toLocaleString() + ')',
      );
      return this.aiCache.insights;
    }

    try {
      this.logger.log('🤖 Gerando novos insights com Together AI...');

      // Preparar dados históricos (últimos registros de 5 em 5 minutos)
      const recentData = data.slice(0, Math.min(72, data.length)); // até 6 horas (72 * 5min)
      const tempHistory = recentData.map((d) => d.temperature).reverse();
      const humidityHistory = recentData.map((d) => d.humidity).reverse();
      const windHistory = recentData.map((d) => d.wind_speed).reverse();

      const prompt = `Você é um meteorologista especializado em análise de dados climáticos.

DADOS CLIMÁTICOS COLETADOS (intervalos de 5 minutos):

📊 ESTATÍSTICAS ATUAIS:
- Temperatura: ${stats.temperature.current}°C
  • Média: ${stats.temperature.avg.toFixed(1)}°C
  • Variação: ${stats.temperature.min.toFixed(1)}°C - ${stats.temperature.max.toFixed(1)}°C
  • Tendência: ${
    stats.temperature.trend > 0 ? 'Aquecendo' : 'Esfriando'
  } (${stats.temperature.trend.toFixed(1)}°C)

- Umidade: ${stats.humidity.current}%
  • Média: ${stats.humidity.avg.toFixed(0)}%
  • Variação: ${stats.humidity.min}% - ${stats.humidity.max}%

- Vento: ${stats.wind_speed.current} km/h
  • Média: ${stats.wind_speed.avg.toFixed(1)} km/h
  • Máximo: ${stats.wind_speed.max.toFixed(1)} km/h

- Precipitação: ${stats.precipitation.total.toFixed(1)} mm acumulados

📈 HISTÓRICO (últimas ${recentData.length} medições de 5 em 5 minutos):
- Temperaturas: [${tempHistory.slice(-12).join(', ')}]°C
- Umidade: [${humidityHistory.slice(-12).join(', ')}]%
- Vento: [${windHistory
        .slice(-12)
        .map((v) => v.toFixed(1))
        .join(', ')}] km/h

🎯 SUA MISSÃO:
Com base nos padrões observados nos dados de 5 em 5 minutos, forneça:

1. **ANÁLISE DAS CONDIÇÕES ATUAIS** (2-3 frases):
   - O que está acontecendo agora no clima?
   - Quais padrões você identifica nos últimos registros?

2. **PREVISÃO PARA AS PRÓXIMAS 6 HORAS** (3-4 frases):
   - Como a temperatura deve evoluir?
   - A umidade vai aumentar ou diminuir?
   - Há chance de chuva ou mudanças bruscas?
   - Baseie-se nas tendências dos intervalos de 5 minutos

3. **RECOMENDAÇÕES PRÁTICAS** (2-3 frases):
   - O que as pessoas devem fazer?
   - Que cuidados tomar?

Responda em português BR, de forma objetiva e prática. Máximo 3 parágrafos curtos.`;

      const response = await axios.post(
        this.TOGETHER_API_URL,
        {
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          messages: [
            {
              role: 'system',
              content:
                'Você é um meteorologista experiente que analisa dados climáticos e faz previsões precisas.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.togetherApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const aiInsights = response.data.choices[0]?.message?.content || null;

      if (aiInsights) {
        // Salvar no cache com validade de 6 horas
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_HOURS * 60 * 60 * 1000);

        this.aiCache = {
          insights: aiInsights,
          timestamp: now,
          expiresAt: expiresAt,
        };

        this.logger.log(
          `✅ Insights gerados e armazenados em cache até ${expiresAt.toLocaleString()}`,
        );
      }

      return aiInsights;
    } catch (error) {
      this.logger.error(
        '❌ Erro ao gerar insights com Together AI:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  /**
   * Gera resumo textual
   */
  private generateSummary(stats: WeatherStatistics, patterns: WeatherPattern[]): string {
    const condition = this.getWeatherCondition(stats.temperature.current, stats.humidity.current);
    const trend = stats.temperature.trend > 0 ? 'aquecendo' : 'esfriando';

    let summary = `Condições ${condition}. Temperatura atual de ${stats.temperature.current}°C, ${trend} em relação aos registros anteriores.`;

    if (patterns.length > 0) {
      summary += ` Detectados ${patterns.length} padrão(ões) relevante(s).`;
    }

    return summary;
  }

  /**
   * Gera recomendações
   */
  private generateRecommendations(stats: WeatherStatistics, patterns: WeatherPattern[]): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas em temperatura
    if (stats.temperature.current > 30) {
      recommendations.push(
        '🌡️ Temperatura elevada. Mantenha-se hidratado e evite exposição prolongada ao sol.',
      );
    } else if (stats.temperature.current < 15) {
      recommendations.push('❄️ Temperatura baixa. Use roupas adequadas para o frio.');
    }

    // Recomendações baseadas em umidade
    if (stats.humidity.current > 80) {
      recommendations.push('💧 Umidade alta. Pode haver sensação de abafamento.');
    }

    // Recomendações baseadas em vento
    if (stats.wind_speed.current > 30) {
      recommendations.push('💨 Ventos fortes. Tome cuidado ao ar livre.');
    }

    // Recomendações baseadas em precipitação
    if (stats.precipitation.total > 5) {
      recommendations.push('☔ Precipitação significativa. Leve guarda-chuva.');
    }

    // Recomendações baseadas em padrões
    patterns.forEach((pattern) => {
      if (pattern.severity === 'high') {
        recommendations.push(`⚠️ ${pattern.description}: ${pattern.value}`);
      }
    });

    return recommendations;
  }

  /**
   * Determina condição geral do clima
   */
  private getWeatherCondition(temp: number, humidity: number): string {
    if (temp > 30 && humidity < 40) return 'quentes e secas';
    if (temp > 25 && humidity > 70) return 'quentes e úmidas';
    if (temp < 15) return 'frias';
    if (humidity > 80) return 'úmidas';
    return 'amenas';
  }

  // Funções auxiliares
  private average(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  private median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const recent = values.slice(0, Math.floor(values.length / 2));
    const older = values.slice(Math.floor(values.length / 2));
    return this.average(recent) - this.average(older);
  }
}
