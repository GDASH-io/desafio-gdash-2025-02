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
  private insightsCache: Map<
    string,
    { data: WeatherInsightsDto; timestamp: Date }
  > = new Map();
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

  /**
   * Invalida o cache de insights
   * Deve ser chamado quando novos dados são coletados
   */
  invalidateCache(): void {
    this.insightsCache.clear();
    this.logger.log('Cache de insights invalidado');
  }

  async generateInsights(): Promise<WeatherInsightsDto> {
    const cacheKey = 'insights_latest';
    const cached = this.insightsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_TTL) {
      return cached.data;
    }

    // Buscar apenas o último registro (mais recente)
    const latestLog = await this.weatherLogModel
      .findOne()
      .sort({ timestamp: -1 })
      .exec();

    if (!latestLog) {
      return this.getDefaultInsights();
    }

    try {
      const insights = await this.generateWithAI(latestLog);
      this.insightsCache.set(cacheKey, {
        data: insights,
        timestamp: new Date(),
      });
      return insights;
    } catch (error) {
      this.logger.error(
        'Error generating insights with AI, using fallback',
        error,
      );
      return this.generateFallbackInsights(latestLog);
    }
  }

  private getLocationName(latitude: number, longitude: number): string {
    // Verificar se as coordenadas correspondem a Florianópolis
    // Tolerância de 0.1 grau para permitir pequenas variações
    if (
      Math.abs(latitude - -27.78) < 0.1 &&
      Math.abs(longitude - -48.52) < 0.1
    ) {
      return 'Florianópolis';
    }

    // Se a localização já for um nome (não coordenadas), retornar como está
    // Caso contrário, retornar as coordenadas formatadas
    return `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
  }

  private async generateWithAI(
    latestLog: WeatherLogDocument,
  ): Promise<WeatherInsightsDto> {
    // Obter nome da cidade baseado nas coordenadas
    const cityName = this.getLocationName(
      latestLog.latitude,
      latestLog.longitude,
    );

    const currentConditions = `
Condições climáticas atuais:
- Temperatura: ${latestLog.temperature}°C
- Umidade: ${latestLog.humidity}%
- Velocidade do vento: ${latestLog.windSpeed} km/h
- Condição: ${latestLog.description || latestLog.condition}
- Probabilidade de chuva: ${latestLog.rainProbability}%
${latestLog.visibility ? `- Visibilidade: ${latestLog.visibility} km` : ''}
${latestLog.solarRadiation ? `- Radiação solar: ${latestLog.solarRadiation} W/m²` : ''}
${latestLog.pressure ? `- Pressão atmosférica: ${latestLog.pressure} hPa` : ''}
${latestLog.windDirection ? `- Direção do vento: ${latestLog.windDirection}°` : ''}
- Localização: ${cityName}
`;

    const prompt = `Você é um especialista em meteorologia e clima. Analise as seguintes condições climáticas atuais e forneça uma resposta em formato JSON:

${currentConditions}

Forneça uma resposta JSON com a seguinte estrutura:
{
  "analysis": "Análise completa e detalhada das condições climáticas atuais. Seja um especialista do clima e traga informações relevantes para o usuário, explicando o que essas condições significam, como elas se relacionam entre si, e o impacto no conforto e bem-estar. Use linguagem clara e profissional. Em português.",
  "activitySuggestions": [
    "Sugestão de atividade 1 baseada nas condições atuais",
    "Sugestão de atividade 2 baseada nas condições atuais",
    "Sugestão de atividade 3 baseada nas condições atuais"
  ],
  "classification": "agradável|quente|frio|chuvoso|extremo"
}

IMPORTANTE:
- A análise deve ser completa, detalhada e profissional, como um especialista em clima explicaria
- Quando mencionar a localização, use sempre o nome da cidade (ex: "Florianópolis") e NUNCA mencione coordenadas numéricas como (-27.78, -48.52)
- Forneça exatamente 3 sugestões de atividades práticas e relevantes para as condições atuais
- A classificação deve ser uma das opções: "agradável", "quente", "frio", "chuvoso", ou "extremo"
- Retorne APENAS o JSON, sem markdown ou texto adicional
- Todas as respostas devem estar em português`;

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

  private async generateWithOpenAI(
    prompt: string,
  ): Promise<WeatherInsightsDto> {
    if (!this.openai) throw new Error('OpenAI not configured');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return this.parseAIResponse(content);
  }

  private async generateWithGemini(
    prompt: string,
  ): Promise<WeatherInsightsDto> {
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
      const cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      // Garantir que activitySuggestions seja um array com exatamente 3 itens
      let activitySuggestions = Array.isArray(parsed.activitySuggestions)
        ? parsed.activitySuggestions
        : [];

      // Se tiver mais de 3, pegar apenas os 3 primeiros
      if (activitySuggestions.length > 3) {
        activitySuggestions = activitySuggestions.slice(0, 3);
      }

      // Se tiver menos de 3, completar com sugestões genéricas
      while (activitySuggestions.length < 3) {
        activitySuggestions.push(
          'Condições adequadas para atividades ao ar livre',
        );
      }

      return {
        analysis: parsed.analysis || 'Análise não disponível',
        activitySuggestions: activitySuggestions.slice(0, 3),
        classification: this.validateClassification(parsed.classification),
      };
    } catch (error) {
      this.logger.error('Error parsing AI response', error);
      throw error;
    }
  }

  private validateClassification(classification: string): string {
    const validClassifications = [
      'agradável',
      'quente',
      'frio',
      'chuvoso',
      'extremo',
    ];
    if (validClassifications.includes(classification?.toLowerCase())) {
      return classification.toLowerCase();
    }
    return 'agradável'; // Default
  }

  private generateFallbackInsights(
    latestLog: WeatherLogDocument,
  ): WeatherInsightsDto {
    const analysis = this.generateDetailedAnalysis(latestLog);
    const activitySuggestions = this.generateActivitySuggestions(latestLog);
    const classification = this.determineClassification(latestLog);

    return {
      analysis,
      activitySuggestions,
      classification,
    };
  }

  private generateDetailedAnalysis(latestLog: WeatherLogDocument): string {
    const cityName = this.getLocationName(
      latestLog.latitude,
      latestLog.longitude,
    );
    let analysis = `Análise das condições climáticas atuais em ${cityName}:\n\n`;

    analysis += `A temperatura está em ${latestLog.temperature.toFixed(1)}°C, `;

    if (latestLog.temperature > 30) {
      analysis += 'indicando condições de calor. ';
    } else if (latestLog.temperature < 15) {
      analysis += 'indicando condições de frio. ';
    } else {
      analysis += 'em níveis confortáveis. ';
    }

    analysis += `A umidade relativa do ar está em ${latestLog.humidity.toFixed(1)}%, `;

    if (latestLog.humidity < 40) {
      analysis +=
        'indicando ar seco, o que pode causar desconforto respiratório. ';
    } else if (latestLog.humidity > 70) {
      analysis +=
        'indicando ar úmido, o que pode aumentar a sensação térmica. ';
    } else {
      analysis += 'em níveis ideais para o conforto. ';
    }

    analysis += `O vento está soprando a ${latestLog.windSpeed.toFixed(1)} km/h. `;

    if (latestLog.windSpeed > 20) {
      analysis += 'Vento forte pode afetar atividades ao ar livre. ';
    } else if (latestLog.windSpeed < 5) {
      analysis += 'Vento calmo, ideal para atividades ao ar livre. ';
    }

    if (latestLog.rainProbability > 50) {
      analysis += `Há ${latestLog.rainProbability.toFixed(0)}% de probabilidade de chuva, recomenda-se estar preparado. `;
    } else {
      analysis += 'Baixa probabilidade de chuva, condições favoráveis. ';
    }

    if (latestLog.visibility) {
      if (latestLog.visibility < 5) {
        analysis += `A visibilidade está reduzida (${latestLog.visibility.toFixed(1)} km), cuidado ao dirigir. `;
      } else {
        analysis += `A visibilidade está boa (${latestLog.visibility.toFixed(1)} km). `;
      }
    }

    if (latestLog.solarRadiation) {
      if (latestLog.solarRadiation > 800) {
        analysis += `Radiação solar muito alta (${latestLog.solarRadiation.toFixed(0)} W/m²), proteção solar essencial. `;
      } else if (latestLog.solarRadiation > 400) {
        analysis += `Radiação solar moderada (${latestLog.solarRadiation.toFixed(0)} W/m²). `;
      }
    }

    if (latestLog.pressure) {
      analysis += `A pressão atmosférica está em ${latestLog.pressure.toFixed(1)} hPa. `;
    }

    analysis += `\nCondição geral: ${latestLog.description || latestLog.condition}.`;

    return analysis.trim();
  }

  private generateActivitySuggestions(latestLog: WeatherLogDocument): string[] {
    const suggestions: string[] = [];

    // Sugestões baseadas em temperatura
    if (latestLog.temperature > 25 && latestLog.temperature < 30) {
      suggestions.push('Ideal para atividades ao ar livre e exercícios');
      suggestions.push('Perfeito para caminhadas, corridas e esportes');
    } else if (latestLog.temperature > 30) {
      suggestions.push(
        'Use protetor solar e evite exposição prolongada ao sol',
      );
      suggestions.push(
        'Prefira atividades em horários mais frescos (manhã ou fim da tarde)',
      );
      if (latestLog.solarRadiation && latestLog.solarRadiation > 800) {
        suggestions.push('Radiação UV muito alta - proteção solar obrigatória');
      } else {
        suggestions.push(
          'Hidrate-se frequentemente durante atividades ao ar livre',
        );
      }
    } else if (latestLog.temperature < 15) {
      suggestions.push('Use roupas adequadas para o frio');
      suggestions.push('Atividades indoor são mais confortáveis');
      suggestions.push('Se for sair, use camadas de roupa para manter o calor');
    } else {
      suggestions.push(
        'Condições climáticas adequadas para a maioria das atividades',
      );
    }

    // Ajustar baseado em chuva
    if (latestLog.rainProbability > 70) {
      suggestions[0] =
        'Alta probabilidade de chuva - prefira atividades indoor';
      if (suggestions.length > 1) {
        suggestions[1] = 'Leve guarda-chuva se precisar sair';
      }
    } else if (
      latestLog.rainProbability < 30 &&
      latestLog.temperature >= 20 &&
      latestLog.temperature <= 28
    ) {
      if (suggestions.length > 0) {
        suggestions[0] = 'Condições ideais para atividades ao ar livre';
      }
    }

    // Ajustar baseado em vento
    if (latestLog.windSpeed > 20) {
      if (suggestions.length > 1) {
        suggestions[1] = 'Vento forte - cuidado com atividades ao ar livre';
      }
    }

    // Garantir exatamente 3 sugestões
    while (suggestions.length < 3) {
      suggestions.push('Condições adequadas para atividades ao ar livre');
    }

    return suggestions.slice(0, 3);
  }

  private determineClassification(latestLog: WeatherLogDocument): string {
    const temp = latestLog.temperature;
    const rainProb = latestLog.rainProbability;

    // Classificação baseada em temperatura e chuva
    if (temp > 35 || temp < 0) {
      return 'extremo';
    }

    if (rainProb > 70) {
      return 'chuvoso';
    }

    if (temp > 30) {
      return 'quente';
    }

    if (temp < 15) {
      return 'frio';
    }

    return 'agradável';
  }

  private getDefaultInsights(): WeatherInsightsDto {
    return {
      analysis: 'Aguardando coleta de dados climáticos para análise.',
      activitySuggestions: [
        'Aguardando dados para sugestões de atividades',
        'Verifique novamente em alguns minutos',
        'Os dados serão atualizados automaticamente',
      ],
      classification: 'agradável',
    };
  }
}
