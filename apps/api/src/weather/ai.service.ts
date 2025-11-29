import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface WeatherData {
  city: string;
  ts: string | Date;
  temperature: number;
  humidity: number;
  windspeed: number;
}

export interface WeatherAnalysis {
  // Pontuação de conforto (0-100)
  comfortScore: number;
  comfortLevel: string;
  comfortEmoji: string;

  // Classificação do dia
  dayClassification: string;
  dayEmoji: string;

  // Tendências
  tempTrend: 'subindo' | 'estável' | 'caindo';
  humidityTrend: 'subindo' | 'estável' | 'caindo';
  trendEmoji: string;

  // Estatísticas
  stats: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    avgHumidity: number;
    maxHumidity: number;
    minHumidity: number;
    avgWind: number;
    maxWind: number;
    tempVariation: number;
  };

  // Sensação térmica
  feelsLike: number;

  // Índice UV estimado (baseado em hora e condições)
  uvIndex: string;

  // Alertas
  alerts: Array<{
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    icon: string;
  }>;

  // Recomendações
  recommendations: string[];

  // Resumo narrativo
  narrative: string;
}

@Injectable()
export class AIService {
  private openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-xxxx' && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateInsights(weatherData: WeatherData[]): Promise<{
    insights: string;
    analysis: WeatherAnalysis | null;
    generatedAt: string;
    source: 'ai' | 'local';
  }> {
    const analysis = this.analyzeWeatherData(weatherData);

    if (this.openai && weatherData.length > 0) {
      try {
        const aiInsights = await this.generateOpenAIInsights(weatherData, analysis);
        return {
          insights: aiInsights,
          analysis,
          generatedAt: new Date().toISOString(),
          source: 'ai',
        };
      } catch (error) {
        console.error('Erro ao gerar insights com OpenAI:', error);
      }
    }

    return {
      insights: this.generateLocalInsights(weatherData, analysis),
      analysis,
      generatedAt: new Date().toISOString(),
      source: 'local',
    };
  }

  private analyzeWeatherData(data: WeatherData[]): WeatherAnalysis | null {
    if (data.length === 0) return null;

    const latest = data[0];
    const temps = data.map((d) => d.temperature);
    const humidities = data.map((d) => d.humidity);
    const winds = data.map((d) => d.windspeed);

    // Estatísticas básicas
    const stats = {
      avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      maxHumidity: Math.max(...humidities),
      minHumidity: Math.min(...humidities),
      avgWind: winds.reduce((a, b) => a + b, 0) / winds.length,
      maxWind: Math.max(...winds),
      tempVariation: Math.max(...temps) - Math.min(...temps),
    };

    // Calcular sensação térmica (Heat Index simplificado)
    const feelsLike = this.calculateFeelsLike(latest.temperature, latest.humidity, latest.windspeed);

    // Calcular pontuação de conforto (0-100)
    const { comfortScore, comfortLevel, comfortEmoji } = this.calculateComfortScore(
      latest.temperature,
      latest.humidity,
      latest.windspeed,
    );

    // Detectar tendências
    const tempTrend = this.detectTrend(temps);
    const humidityTrend = this.detectTrend(humidities);
    const trendEmoji = tempTrend === 'subindo' ? '📈' : tempTrend === 'caindo' ? '📉' : '➡️';

    // Classificar o dia
    const { dayClassification, dayEmoji } = this.classifyDay(
      latest.temperature,
      latest.humidity,
      latest.windspeed,
    );

    // Estimar índice UV
    const uvIndex = this.estimateUVIndex(latest.ts, latest.humidity);

    // Gerar alertas
    const alerts = this.generateAlerts(latest, stats);

    // Gerar recomendações
    const recommendations = this.generateRecommendations(latest, stats, comfortScore);

    // Gerar narrativa
    const narrative = this.generateNarrative(latest, stats, tempTrend, data.length);

    return {
      comfortScore,
      comfortLevel,
      comfortEmoji,
      dayClassification,
      dayEmoji,
      tempTrend,
      humidityTrend,
      trendEmoji,
      stats,
      feelsLike,
      uvIndex,
      alerts,
      recommendations,
      narrative,
    };
  }

  private calculateFeelsLike(temp: number, humidity: number, wind: number): number {
    // Heat Index para temperaturas altas
    if (temp >= 27 && humidity >= 40) {
      const hi =
        -8.78469475556 +
        1.61139411 * temp +
        2.33854883889 * humidity -
        0.14611605 * temp * humidity -
        0.012308094 * temp * temp -
        0.0164248277778 * humidity * humidity +
        0.002211732 * temp * temp * humidity +
        0.00072546 * temp * humidity * humidity -
        0.000003582 * temp * temp * humidity * humidity;
      return Math.round(hi * 10) / 10;
    }

    // Wind Chill para temperaturas baixas
    if (temp <= 10 && wind > 4.8) {
      const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
      return Math.round(wc * 10) / 10;
    }

    return temp;
  }

  private calculateComfortScore(
    temp: number,
    humidity: number,
    wind: number,
  ): { comfortScore: number; comfortLevel: string; comfortEmoji: string } {
    let score = 100;

    // Penalidade por temperatura (ideal: 20-25°C)
    if (temp < 15) score -= (15 - temp) * 4;
    else if (temp < 20) score -= (20 - temp) * 2;
    else if (temp > 28) score -= (temp - 28) * 3;
    else if (temp > 25) score -= (temp - 25) * 1.5;

    // Penalidade por umidade (ideal: 40-60%)
    if (humidity < 30) score -= (30 - humidity) * 0.5;
    else if (humidity > 70) score -= (humidity - 70) * 0.8;
    else if (humidity > 80) score -= (humidity - 80) * 1.2;

    // Penalidade por vento forte
    if (wind > 30) score -= (wind - 30) * 0.5;
    else if (wind > 50) score -= (wind - 50) * 1;

    // Bônus por brisa leve em dia quente
    if (temp > 25 && wind >= 5 && wind <= 20) score += 5;

    score = Math.max(0, Math.min(100, score));

    let comfortLevel: string;
    let comfortEmoji: string;

    if (score >= 85) {
      comfortLevel = 'Excelente';
      comfortEmoji = '😊';
    } else if (score >= 70) {
      comfortLevel = 'Bom';
      comfortEmoji = '🙂';
    } else if (score >= 55) {
      comfortLevel = 'Moderado';
      comfortEmoji = '😐';
    } else if (score >= 40) {
      comfortLevel = 'Desconfortável';
      comfortEmoji = '😕';
    } else {
      comfortLevel = 'Ruim';
      comfortEmoji = '😫';
    }

    return { comfortScore: Math.round(score), comfortLevel, comfortEmoji };
  }

  private detectTrend(values: number[]): 'subindo' | 'estável' | 'caindo' {
    if (values.length < 3) return 'estável';

    // Pegar os últimos 5 valores (mais recentes primeiro, então invertemos)
    const recent = values.slice(0, Math.min(5, values.length)).reverse();
    
    // Calcular a tendência usando regressão linear simples
    const n = recent.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = recent.reduce((a, b) => a + b, 0);
    const sumXY = recent.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 0.5) return 'subindo';
    if (slope < -0.5) return 'caindo';
    return 'estável';
  }

  private classifyDay(
    temp: number,
    humidity: number,
    wind: number,
  ): { dayClassification: string; dayEmoji: string } {
    // Chuvoso
    if (humidity > 85 && temp < 25) {
      return { dayClassification: 'Chuvoso', dayEmoji: '🌧️' };
    }

    // Tempestuoso
    if (humidity > 80 && wind > 40) {
      return { dayClassification: 'Tempestuoso', dayEmoji: '⛈️' };
    }

    // Muito quente
    if (temp > 35) {
      return { dayClassification: 'Muito Quente', dayEmoji: '🔥' };
    }

    // Quente
    if (temp > 28) {
      return { dayClassification: 'Quente', dayEmoji: '☀️' };
    }

    // Frio
    if (temp < 12) {
      return { dayClassification: 'Frio', dayEmoji: '❄️' };
    }

    // Fresco
    if (temp < 18) {
      return { dayClassification: 'Fresco', dayEmoji: '🌬️' };
    }

    // Nublado
    if (humidity > 70) {
      return { dayClassification: 'Nublado', dayEmoji: '☁️' };
    }

    // Ventoso
    if (wind > 35) {
      return { dayClassification: 'Ventoso', dayEmoji: '💨' };
    }

    // Agradável
    if (temp >= 20 && temp <= 28 && humidity >= 40 && humidity <= 70) {
      return { dayClassification: 'Agradável', dayEmoji: '🌤️' };
    }

    // Parcialmente nublado
    if (humidity > 50) {
      return { dayClassification: 'Parcialmente Nublado', dayEmoji: '⛅' };
    }

    return { dayClassification: 'Ensolarado', dayEmoji: '☀️' };
  }

  private estimateUVIndex(timestamp: string | Date, humidity: number): string {
    const now = new Date(timestamp);
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60;
    const localTime = new Date(now.getTime() + (brasiliaOffset - now.getTimezoneOffset()) * 60000);
    const hour = localTime.getHours();

    // Noite
    if (hour < 6 || hour > 18) return 'Baixo (0-2)';

    // Amanhecer/Entardecer
    if (hour < 9 || hour > 16) return 'Moderado (3-5)';

    // Meio do dia com umidade alta (nuvens)
    if (humidity > 80) return 'Moderado (3-5)';

    // Meio do dia ensolarado
    if (hour >= 10 && hour <= 14) {
      if (humidity < 50) return 'Muito Alto (8-10)';
      return 'Alto (6-7)';
    }

    return 'Alto (6-7)';
  }

  private generateAlerts(
    latest: WeatherData,
    stats: WeatherAnalysis['stats'],
  ): WeatherAnalysis['alerts'] {
    const alerts: WeatherAnalysis['alerts'] = [];

    // Alertas de temperatura
    if (latest.temperature > 38) {
      alerts.push({
        type: 'danger',
        title: 'Calor Extremo',
        message: `Temperatura de ${latest.temperature.toFixed(1)}°C! Risco à saúde. Evite exposição ao sol e mantenha-se hidratado.`,
        icon: '🔥',
      });
    } else if (latest.temperature > 32) {
      alerts.push({
        type: 'warning',
        title: 'Muito Quente',
        message: `Temperatura de ${latest.temperature.toFixed(1)}°C. Beba bastante água e evite atividades intensas ao ar livre.`,
        icon: '☀️',
      });
    } else if (latest.temperature < 5) {
      alerts.push({
        type: 'danger',
        title: 'Frio Intenso',
        message: `Temperatura de ${latest.temperature.toFixed(1)}°C! Vista roupas adequadas e proteja-se.`,
        icon: '🥶',
      });
    } else if (latest.temperature < 12) {
      alerts.push({
        type: 'info',
        title: 'Temperatura Baixa',
        message: `Temperatura de ${latest.temperature.toFixed(1)}°C. Recomenda-se agasalho.`,
        icon: '❄️',
      });
    }

    // Alertas de umidade
    if (latest.humidity > 90) {
      alerts.push({
        type: 'warning',
        title: 'Umidade Muito Alta',
        message: `Umidade em ${latest.humidity.toFixed(0)}%. Alta probabilidade de chuva nas próximas horas.`,
        icon: '🌧️',
      });
    } else if (latest.humidity < 25) {
      alerts.push({
        type: 'warning',
        title: 'Ar Muito Seco',
        message: `Umidade em apenas ${latest.humidity.toFixed(0)}%. Hidrate-se e use hidratante.`,
        icon: '🏜️',
      });
    }

    // Alertas de vento
    if (latest.windspeed > 60) {
      alerts.push({
        type: 'danger',
        title: 'Vendaval',
        message: `Ventos de ${latest.windspeed.toFixed(1)} km/h! Evite áreas abertas e cuidado com objetos soltos.`,
        icon: '🌪️',
      });
    } else if (latest.windspeed > 40) {
      alerts.push({
        type: 'warning',
        title: 'Ventos Fortes',
        message: `Ventos de ${latest.windspeed.toFixed(1)} km/h. Cuidado ao dirigir e com objetos leves.`,
        icon: '💨',
      });
    }

    // Alerta de grande variação térmica
    if (stats.tempVariation > 12) {
      alerts.push({
        type: 'info',
        title: 'Grande Variação Térmica',
        message: `Variação de ${stats.tempVariation.toFixed(1)}°C registrada. Leve agasalho para mudanças bruscas.`,
        icon: '🌡️',
      });
    }

    // Clima agradável
    if (
      alerts.length === 0 &&
      latest.temperature >= 20 &&
      latest.temperature <= 28 &&
      latest.humidity >= 40 &&
      latest.humidity <= 70
    ) {
      alerts.push({
        type: 'success',
        title: 'Clima Perfeito',
        message: 'Condições climáticas ideais para atividades ao ar livre!',
        icon: '✨',
      });
    }

    return alerts;
  }

  private generateRecommendations(
    latest: WeatherData,
    stats: WeatherAnalysis['stats'],
    comfortScore: number,
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações de vestuário
    if (latest.temperature > 30) {
      recommendations.push('👕 Vista roupas leves e claras');
      recommendations.push('🧴 Use protetor solar FPS 30+');
    } else if (latest.temperature < 18) {
      recommendations.push('🧥 Leve um agasalho ou casaco');
    }

    // Hidratação
    if (latest.temperature > 28 || latest.humidity < 40) {
      recommendations.push('💧 Beba água frequentemente (2-3L/dia)');
    }

    // Atividades
    if (comfortScore >= 70 && latest.windspeed < 30) {
      recommendations.push('🏃 Ótimo momento para exercícios ao ar livre');
    } else if (latest.temperature > 32) {
      recommendations.push('🏠 Prefira atividades em ambientes climatizados');
    }

    // Proteção
    if (latest.humidity > 85) {
      recommendations.push('☂️ Leve guarda-chuva por precaução');
    }

    if (latest.windspeed > 35) {
      recommendations.push('🚗 Dirija com cuidado - ventos fortes');
    }

    // Ar condicionado
    if (latest.temperature > 30 && latest.humidity > 70) {
      recommendations.push('❄️ Ambientes climatizados são recomendados');
    }

    // Ventilação
    if (latest.humidity > 80 && latest.temperature > 25) {
      recommendations.push('🪟 Mantenha ambientes ventilados');
    }

    return recommendations.slice(0, 5); // Máximo 5 recomendações
  }

  private generateNarrative(
    latest: WeatherData,
    stats: WeatherAnalysis['stats'],
    tempTrend: string,
    totalRecords: number,
  ): string {
    const city = latest.city;
    const now = new Date(latest.ts);
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const localTime = new Date(now.getTime() + (brasiliaOffset - now.getTimezoneOffset()) * 60000);
    const hour = localTime.getHours();
    const period =
      hour < 12 ? 'da manhã' : hour < 18 ? 'da tarde' : 'da noite';

    let narrative = `📍 **${city}** - `;

    // Saudação baseada no período (horário de Brasília)
    if (hour < 12) narrative += 'Bom dia! ';
    else if (hour < 18) narrative += 'Boa tarde! ';
    else narrative += 'Boa noite! ';

    // Descrição atual
    narrative += `Neste momento, registramos **${latest.temperature.toFixed(1)}°C** `;

    if (latest.temperature > 30) {
      narrative += 'com calor intenso ';
    } else if (latest.temperature > 25) {
      narrative += 'com clima quente ';
    } else if (latest.temperature < 15) {
      narrative += 'com clima frio ';
    } else {
      narrative += 'com temperatura agradável ';
    }

    narrative += `e umidade de **${latest.humidity.toFixed(0)}%**. `;

    // Vento
    if (latest.windspeed > 30) {
      narrative += `Os ventos estão fortes, a **${latest.windspeed.toFixed(1)} km/h**. `;
    } else if (latest.windspeed > 15) {
      narrative += `Há uma brisa moderada de **${latest.windspeed.toFixed(1)} km/h**. `;
    }

    // Tendência
    narrative += '\n\n';
    if (tempTrend === 'subindo') {
      narrative += '📈 **Tendência:** A temperatura está em **elevação**. ';
      if (latest.temperature > 25) {
        narrative += 'Espere um período ${period} ainda mais quente.';
      }
    } else if (tempTrend === 'caindo') {
      narrative += '📉 **Tendência:** A temperatura está em **queda**. ';
      if (hour > 16) {
        narrative += 'Normal para o período noturno.';
      }
    } else {
      narrative += '➡️ **Tendência:** Temperatura **estável** nas últimas horas.';
    }

    // Estatísticas
    if (totalRecords > 1) {
      narrative += `\n\n📊 **Estatísticas** (${totalRecords} registros): `;
      narrative += `Temperatura variou entre **${stats.minTemp.toFixed(1)}°C** e **${stats.maxTemp.toFixed(1)}°C** `;
      narrative += `(média de **${stats.avgTemp.toFixed(1)}°C**).`;
    }

    return narrative;
  }

  private async generateOpenAIInsights(
    weatherData: WeatherData[],
    analysis: WeatherAnalysis | null,
  ): Promise<string> {
    if (!analysis) return 'Dados insuficientes para análise.';

    const latest = weatherData[0];
    const prompt = `
Você é um meteorologista experiente e comunicativo. Analise os seguintes dados climáticos e forneça insights úteis, criativos e práticos em português brasileiro.

**Dados Atuais - ${latest.city}:**
- Temperatura: ${latest.temperature.toFixed(1)}°C (Sensação: ${analysis.feelsLike.toFixed(1)}°C)
- Umidade: ${latest.humidity.toFixed(0)}%
- Vento: ${latest.windspeed.toFixed(1)} km/h
- Horário: ${new Date(latest.ts).toLocaleString('pt-BR')}

**Análise Prévia:**
- Pontuação de Conforto: ${analysis.comfortScore}/100 (${analysis.comfortLevel})
- Classificação: ${analysis.dayClassification}
- Tendência de Temperatura: ${analysis.tempTrend}
- Índice UV Estimado: ${analysis.uvIndex}

**Estatísticas (${weatherData.length} registros):**
- Temp. Média: ${analysis.stats.avgTemp.toFixed(1)}°C | Mín: ${analysis.stats.minTemp.toFixed(1)}°C | Máx: ${analysis.stats.maxTemp.toFixed(1)}°C
- Umidade Média: ${analysis.stats.avgHumidity.toFixed(0)}%
- Vento Médio: ${analysis.stats.avgWind.toFixed(1)} km/h
- Variação Térmica: ${analysis.stats.tempVariation.toFixed(1)}°C

**Sua resposta deve incluir:**
1. Um resumo criativo e envolvente do clima atual (2-3 frases)
2. Previsão/tendência para as próximas horas baseada nos dados
3. 2-3 dicas práticas personalizadas para o momento
4. Um toque de personalidade (use emojis e linguagem amigável)

Mantenha a resposta concisa (máximo 200 palavras) e útil para o dia a dia.
    `.trim();

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente meteorológico amigável, criativo e prático. Suas análises são precisas mas também envolventes e fáceis de entender.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    return response.choices[0]?.message?.content || this.generateLocalInsights(weatherData, analysis);
  }

  private generateLocalInsights(
    weatherData: WeatherData[],
    analysis: WeatherAnalysis | null,
  ): string {
    if (!analysis || weatherData.length === 0) {
      return '🌤️ Aguardando dados climáticos para gerar análise...\n\nOs insights serão gerados automaticamente assim que houver registros suficientes.';
    }

    const latest = weatherData[0];
    let insights = '';

    // Cabeçalho
    insights += `${analysis.dayEmoji} **Clima ${analysis.dayClassification}** em ${latest.city}\n\n`;

    // Narrativa principal
    insights += analysis.narrative;

    // Pontuação de conforto
    insights += `\n\n🎯 **Índice de Conforto:** ${analysis.comfortScore}/100 ${analysis.comfortEmoji}\n`;
    insights += `_${analysis.comfortLevel}_ - `;

    if (analysis.comfortScore >= 70) {
      insights += 'Excelentes condições para atividades ao ar livre!';
    } else if (analysis.comfortScore >= 50) {
      insights += 'Condições aceitáveis, mas tome precauções.';
    } else {
      insights += 'Considere atividades em ambientes fechados.';
    }

    // Sensação térmica se diferente
    if (Math.abs(analysis.feelsLike - latest.temperature) > 2) {
      insights += `\n\n🌡️ **Sensação Térmica:** ${analysis.feelsLike.toFixed(1)}°C`;
      if (analysis.feelsLike > latest.temperature) {
        insights += ' (mais quente devido à umidade)';
      } else {
        insights += ' (mais frio devido ao vento)';
      }
    }

    // Índice UV
    insights += `\n\n☀️ **Índice UV Estimado:** ${analysis.uvIndex}`;

    // Recomendações
    if (analysis.recommendations.length > 0) {
      insights += '\n\n📋 **Recomendações:**\n';
      analysis.recommendations.forEach((rec) => {
        insights += `• ${rec}\n`;
      });
    }

    return insights;
  }
}
